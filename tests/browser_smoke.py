
from pathlib import Path
import json, time, os
from playwright.sync_api import sync_playwright
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--preview',default=str(Path(__file__).resolve().parents[1]/'preview.html'))
parser.add_argument('--output',default=str(Path(__file__).resolve().parent/'browser-output'))
parser.add_argument('--chromium',default=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'))
args=parser.parse_args()
ROOT=Path(args.output);ROOT.mkdir(parents=True,exist_ok=True)
HTML=Path(args.preview).read_text()
results=[];errors=[]
def record(name,ok=True,extra=''):
    results.append({'name':name,'ok':bool(ok),'detail':extra})
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=args.chromium,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    page.set_default_timeout(5000)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('dialog',lambda d:d.accept())
    page.set_content(HTML,wait_until='load');page.wait_for_timeout(1400)
    record('parallel bootstrap',page.evaluate('ATLAS_DIAGNOSTICS().quotes')==52)
    record('initial histories',page.evaluate('ATLAS_DIAGNOSTICS().histories')==6)
    def shot(name):
        page.evaluate('document.activeElement?.blur();window.scrollTo(0,0)');page.wait_for_timeout(150)
        page.screenshot(path=str(ROOT/name),full_page=False)
    def route(r):
        page.evaluate('(r)=>location.hash=r',r);page.wait_for_timeout(450)
    for r in ['themes','companies','chain','creators','heat','calendar','research','risk','screener','ai','portfolio','watch','settings','coverage']:
        route(r)
        record('page '+r, page.locator('#main').inner_text().strip()!='')
        overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
        record('desktop no page overflow '+r,not overflow)
    route('company/2330/TW')
    for tab in ['basic','industry','finance','chips','etf','technical','news','research']:
        page.locator('[data-action="company-tab"][data-tab="'+tab+'"]').click();page.wait_for_timeout(300)
        record('company tab '+tab, len(page.locator('#main').inner_text())>100)
    page.locator('[data-action="company-tab"][data-tab="technical"]').click();page.wait_for_timeout(250)
    record('candles present',page.locator('[data-candle]').count()>20)
    for unit in ['week','month','day']:
        page.locator('[data-action="chart-unit"][data-value="'+unit+'"]').click()
        record('chart '+unit,page.locator('[data-candle]').count()>2)
    for indicator in ['macd','rsi','dmi','kd']:
        page.locator('[data-action="indicator"][data-value="'+indicator+'"]').click()
        record('indicator '+indicator,page.locator('.chart').count()>=2)
    page.locator('[data-candle]').last.click();record('pin candle','2026-' in page.locator('#ohlc').inner_text())
    shot('desktop-company.png')
    # search modal, favorite and company routing
    page.locator('#global-search').click();page.locator('#search-input').fill('2330')
    record('search matched',page.locator('#search-results').inner_text().find('台積電')>=0)
    page.locator('#search-results [data-action="watch-stock"]').click()
    page.locator('[data-action="close-modal"]').first.click();route('watch')
    record('watch saved','台積電' in page.locator('#main').inner_text())
    # basic trading and oversell guard
    route('portfolio');page.locator('[data-action="add-trade"]').first.click()
    page.locator('#f-stock').fill('2330');page.locator('#f-name').fill('TEST')
    page.locator('#f-qty').fill('100');page.locator('#f-price').fill('100')
    page.locator('#f-fee').fill('10');page.locator('#trade-form button[type="submit"]').click()
    record('trade stored',page.evaluate('JSON.parse(localStorage.getItem("atlas-map-v9-user")).trades.length')==1)
    page.locator('[data-action="add-trade"]').first.click()
    page.locator('#f-stock').fill('2330');page.locator('#f-side').select_option('sell')
    page.locator('#f-qty').fill('101');page.locator('#f-price').fill('110')
    page.locator('#trade-form button[type="submit"]').click()
    record('oversell visible error','賣出超過' in page.locator('#form-error').inner_text())
    page.locator('[data-action="close-modal"]').first.click()
    # note persistence
    page.locator('[data-action="portfolio-tab"][data-tab="notes"]').click()
    page.locator('[data-action="add-note"]').first.click()
    page.locator('#f-title').fill('QA note')
    page.locator('#f-text').fill('<img src=x onerror=alert(1)> source checked')
    page.locator('#note-form button[type="submit"]').click()
    record('note escaped',page.locator('#main img').count()==0 and 'QA note' in page.locator('#main').inner_text())
    # event
    route('calendar');page.locator('[data-action="add-event"]').first.click()
    page.locator('#f-title').fill('QA event');page.locator('#f-date').fill('2026-09-25')
    page.locator('#event-form button[type="submit"]').click()
    record('calendar saved','QA event' in page.locator('#main').inner_text())
    # creators
    route('creators');page.locator('[data-action="add-creator"]').first.click()
    page.locator('#f-name').fill('QA source');page.locator('#f-url').fill('https://www.twse.com.tw/')
    page.locator('#creator-form button[type="submit"]').click()
    record('creator saved','QA source' in page.locator('#main').inner_text())
    # research
    route('research')
    for q,n in [('2026Q1',100),('2026Q2',120)]:
        page.locator('[data-action="add-study"]').first.click()
        page.locator('#f-title').fill('QA earnings '+q);page.locator('#f-stock').fill('2330')
        page.locator('#f-quarter').fill(q);page.locator('#f-url').fill('https://www.twse.com.tw/')
        page.locator('#f-summary').fill('Test summary, not real data')
        page.locator('#f-revenue').fill(str(n));page.locator('#study-form button[type="submit"]').click()
    page.locator('[data-action="compare-studies"]').click()
    record('quarter compare','20.00%' in page.locator('#study-comparison').inner_text())
    page.locator('[data-action="close-modal"]').first.click()
    # rule screen + backtest
    route('screener');page.locator('[data-action="apply-rules"]').click()
    record('rule boolean matches',page.locator('.table tbody tr').count()>1)
    page.locator('[data-action="open-backtest"]').click()
    page.locator('#f-stock').fill('2330')
    page.locator('#backtest-form button[type="submit"]').click();page.wait_for_timeout(300)
    record('backtest rendered','回測結果' in page.locator('#backtest-output').inner_text())
    page.locator('[data-action="close-modal"]').first.click()
    # online summary explicitly not AI
    route('ai');page.locator('[data-action="data-summary"]').click()
    record('offline summary truthful','非生成式 AI' in page.locator('#ai-output').inner_text())
    # theme and heat screenshot
    route('themes');shot('desktop-themes.png')
    route('heat');record('heat tiles',page.locator('.heat-tile').count()>10)
    shot('desktop-heat.png')
    route('chain');shot('desktop-chain.png')
    # switching unconfigured market should not poison TW state
    page.locator('[data-action="market"][data-market="KR"]').click();page.wait_for_timeout(250)
    record('KR remains unconfigured','未附' in page.locator('#main').inner_text() or '失敗' in page.locator('body').inner_text())
    page.locator('[data-action="market"][data-market="TW"]').click();page.wait_for_timeout(300)
    record('TW recovered',page.evaluate('ATLAS_DIAGNOSTICS().quotes')==52)
    # Mobile viewport routing
    page.set_viewport_size({'width':390,'height':844})
    for r in ['focus','themes','company/2330/TW','heat','calendar','screener','portfolio','settings']:
        route(r);page.wait_for_timeout(100)
        record('mobile no overflow '+r,not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'))
    route('themes');shot('mobile-themes.png')
    route('focus');shot('mobile-focus.png')
    page.locator('#global-search').click()
    record('mobile search modal visible',page.locator('.dialog').is_visible())
    page.locator('[data-action="close-modal"]').first.click()
    # Dynamic actual front-end state still available
    record('no browser page exceptions',len(errors)==0,';'.join(errors))
    # Fault injection uses the exact same frontend with explicit fixture-only responses.
    for mode in ['status-failed','quotes-failed','all-failed']:
        condition=('u.includes("/status")' if mode=='status-failed' else
                   'u.includes("/quotes")' if mode=='quotes-failed' else
                   'u.includes("/api/atlas/")')
        wrapper='<script>const savedFixtureFetch=globalThis.fetch;globalThis.fetch=async function(input,opts){const u=String(input);if('+condition+'){return new Response(JSON.stringify({error:"INJECTED TEST FAILURE"}),{status:503,headers:{"Content-Type":"application/json"}});}return savedFixtureFetch(input,opts);};</script>'
        injected=HTML.replace('<script type="module">',wrapper+'<script type="module">',1)
        q=browser.new_page(viewport={'width':1280,'height':900})
        q.on('pageerror',lambda e:errors.append(str(e)))
        q.set_content(injected,wait_until='load');q.wait_for_timeout(1200)
        d=q.evaluate('ATLAS_DIAGNOSTICS()')
        record('fault isolation '+mode,d['quotes']==(52 if mode=='status-failed' else 0))
        q.evaluate('location.hash="settings"');q.wait_for_timeout(200)
        record('fault visible '+mode,'INJECTED TEST FAILURE' in q.locator('body').inner_text())
        q.close()
    record('no exceptions after fault injection',len(errors)==0,';'.join(errors))
    browser.close()
ROOT.joinpath('browser-results.json').write_text(json.dumps({'results':results,'errors':errors},ensure_ascii=False,indent=2))
print(json.dumps({'count':len(results),'passed':sum(r['ok'] for r in results),'failed':[r for r in results if not r['ok']],'errors':errors},ensure_ascii=False,indent=2))
