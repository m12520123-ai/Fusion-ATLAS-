from pathlib import Path
import json, os, sys, requests
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
out=Path(os.environ.get('ATLAS_TEST_OUTPUT',str(ROOT/'docs/test-results')));out.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('ATLAS_TEST_BASE','http://127.0.0.1:8890')
results=[];errors=[]
HTML=(out/'v10-harness.html').read_text()
flags={'failUS':False}
def bridge(path,options):
    if flags['failUS'] and 'quotes?market=US' in path:return {'status':503,'data':{'error':'Yahoo unavailable (TEST)','code':'YAHOO_NETWORK'}}
    r=requests.request(options.get('method','GET'),BASE+path,headers=options.get('headers',{}),data=options.get('body'),timeout=25)
    return {'status':r.status_code,'data':r.json()}

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ')+name,flush=True)
    results.append({'name':name,'ok':bool(ok),'detail':str(detail)[:240]})
with sync_playwright() as pw:
    launch={'headless':True}
    if os.environ.get('CHROMIUM_EXECUTABLE'):launch['executable_path']=os.environ['CHROMIUM_EXECUTABLE']
    browser=pw.chromium.launch(**launch)
    context=browser.new_context(viewport={'width':1440,'height':1000});context.expose_function('__atlasApi',bridge);context.set_default_timeout(9000)
    page=context.new_page();page.set_default_timeout(9000)
    page.on('pageerror', lambda e:errors.append(str(e)))
    page.set_content(HTML,wait_until='load');page.evaluate('location.hash="themes"')
    page.wait_for_function('ATLAS_DIAGNOSTICS().quotes===52')
    check('TW quotes retained',page.evaluate('ATLAS_DIAGNOSTICS().quotes')==52)
    check('backend v10',page.evaluate('ATLAS_DIAGNOSTICS().status.version')=='10.0.0')
    for market,n,symbol in [('US',20,'AAPL'),('JP',4,'7203.T'),('KR',4,'005930.KS')]:
        page.locator('[data-action="market"][data-market="'+market+'"]').click()
        page.wait_for_function('([m,n])=>ATLAS_DIAGNOSTICS().market===m&&ATLAS_DIAGNOSTICS().quotes>=n',arg=[market,n])
        page.wait_for_timeout(300)
        d=page.evaluate('ATLAS_DIAGNOSTICS()');check(market+' all catalog quotes',d['quotes']==n,d)
        check(market+' Yahoo label visible','Yahoo Finance' in page.locator('body').inner_text())
        check(market+' all histories loaded',sum(1 for f in d['feeds'] if f['key'].startswith('history:') and f['state']=='success')>=n)
        page.evaluate('(h)=>location.hash=h','screener');page.wait_for_timeout(250)
        check(market+' screener has signals',page.locator('.table tbody tr').count()>=n)
        check(market+' no missing key warning','TWELVE_DATA_API_KEY' not in page.locator('body').inner_text())
        page.evaluate('(h)=>location.hash=h','company/'+symbol+'/'+market);page.wait_for_timeout(250)
        page.locator('[data-action="company-tab"][data-tab="technical"]').first.click();page.wait_for_timeout(200)
        check(market+' technical candles',page.locator('[data-candle]').count()>20)
        for unit in ['week','month','day']:
            page.locator('[data-action="chart-unit"][data-value="'+unit+'"]').click()
            check(market+' '+unit+' candles',page.locator('[data-candle]').count()>2)
        check(market+' exchange timezone visible',{'US':'America/New_York','JP':'Asia/Tokyo','KR':'Asia/Seoul'}[market] in page.locator('body').inner_text())
        check(market+' no horizontal viewport overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
        page.screenshot(path=str(out/(market+'-desktop-test.png')),full_page=False)
    page.evaluate('location.hash="heat"');page.wait_for_timeout(250)
    check('KR heatmap uses available actual volume',page.locator('.heat-tile').count()==4)
    # A requested symbol not in the seed catalog can be found and watched.
    page.locator('[data-action="market"][data-market="US"]').click();page.wait_for_function('ATLAS_DIAGNOSTICS().market==="US"&&ATLAS_DIAGNOSTICS().quotes>=20')
    page.locator('#global-search').click();page.locator('#search-input').fill('COST')
    page.locator('[data-action="search-yahoo"]').click();page.wait_for_selector('#search-results [data-id="COST"]')
    check('remote Yahoo search result',page.locator('#search-results [data-id="COST"]').count()>=1)
    page.locator('#search-results [data-action="watch-stock"][data-id="COST"]').click()
    page.locator('#search-results [data-action="company"][data-id="COST"]').click();page.wait_for_timeout(400)
    check('new symbol company detail has quote','TEST COST' in page.locator('body').inner_text())
    check('watch uses existing v9 storage',page.evaluate('JSON.parse(localStorage.getItem("atlas-map-v9-user")).watch.includes("COST")'))
    storage=page.evaluate('Object.fromEntries(["atlas-map-v9-user","atlas-map-cache:quotes:US"].map(k=>[k,localStorage.getItem(k)]).filter(v=>v[1]))')
    page.close();page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    restored=HTML.replace('<head>','<head><script>globalThis.ATLAS_TEST_STORAGE='+json.dumps(storage)+';</script>')
    page.set_content(restored,wait_until='load');page.evaluate('location.hash="company/COST/US"');page.wait_for_function('ATLAS_DIAGNOSTICS().quotes>=21')
    check('new watched symbol survives reload',page.evaluate('JSON.parse(localStorage.getItem("atlas-map-v9-user")).watch.includes("COST")'))
    # Refresh failure keeps the old date and visibly labels cached data.
    flags['failUS']=True
    page.evaluate('location.hash="screener"');page.wait_for_timeout(200)
    page.locator('[data-action="refresh"]').first.click();page.wait_for_timeout(500)
    check('failed refresh keeps usable old prices',page.evaluate('ATLAS_DIAGNOSTICS().quotes')>=21)
    check('failed refresh explicitly labels old cache','\u820a\u5feb\u53d6' in page.locator('#main').inner_text())
    flags['failUS']=False
    # Mobile app layout and navigation remain available.
    mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    mobile.on('pageerror',lambda e:errors.append(str(e)))
    mobile.expose_function('__atlasApi',bridge)
    mobile.set_content(HTML,wait_until='load');mobile.evaluate('location.hash="company/005930.KS/KR"')
    mobile.wait_for_function('ATLAS_DIAGNOSTICS().market==="KR"&&ATLAS_DIAGNOSTICS().quotes>=4')
    mobile.locator('[data-action="company-tab"][data-tab="technical"]').first.click();mobile.wait_for_timeout(300)
    check('mobile quote/candles work',mobile.locator('[data-candle]').count()>20)
    check('mobile no horizontal document overflow',mobile.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
    mobile.screenshot(path=str(out/'KR-mobile-test.png'),full_page=False)
    mobile.evaluate('location.hash="settings"');mobile.wait_for_timeout(300)
    check('mobile diagnostics Yahoo present','Yahoo' in mobile.locator('#main').inner_text())
    check('JS no runtime errors',not errors,errors)
    browser.close()
out.joinpath('browser-v10-results.json').write_text(json.dumps({'results':results,'errors':errors},ensure_ascii=False,indent=2))

print('TOTAL',len(results),'PASSED',sum(x['ok'] for x in results))

if errors or any(not item["ok"] for item in results):sys.exit(1)
