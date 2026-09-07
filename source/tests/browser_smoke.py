"""Real browser acceptance tests, collision-enabled preview and live audio evidence."""
import base64,functools,http.server,json,os,pathlib,threading,time,wave
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('EVIDENCE_DIR',str(ROOT/'artifacts/qa')));OUT.mkdir(parents=True,exist_ok=True)
report={'checks':[],'errors':[],'source_commit':os.environ.get('GITHUB_SHA'),'scope':'Chromium desktop and touch emulation, not physical iPhone latency'}
def check(name,condition,details=None):
 report['checks'].append({'name':name,'passed':bool(condition),'details':details})
 print(name,':',bool(condition),flush=True)
 if not condition:raise AssertionError(f'{name}: {details}')
def save_report():(OUT/'report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=os.environ.get('DEMO_URL') if os.environ.get('RUN_REMOTE') else f'http://127.0.0.1:{server.server_port}/'
report['url']=url
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 ctx=browser.new_context(viewport={'width':1280,'height':720},device_scale_factor=1,accept_downloads=True)
 page=ctx.new_page();page.set_default_timeout(12000)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 requests=[];page.on('request',lambda r:requests.append(r.url))
 def load(pg=page):
  for retry in range(8):
   try:
    response=pg.goto(url,wait_until='domcontentloaded',timeout=45000)
    if response and response.status==200:break
   except Exception:
    if retry==7:raise
   time.sleep(5)
  check('HTTP 200',response.status==200,{'status':response.status,'url':url})
  pg.wait_for_function('document.querySelector("geometry-lite-game")?.game?.screen === "menu"');pg.wait_for_timeout(350)
 def g(expr,pg=page):return pg.evaluate('(s)=>{const g=document.querySelector("geometry-lite-game").game;return eval(s)}',expr)
 def shot(name):page.wait_for_timeout(250);page.screenshot(path=str(OUT/(name+'.png')))
 try:
  load();shot('01-menu');check('No iframe',page.locator('iframe').count()==0);check('No audio before gesture',g('g.audio.ctx===null'));check('Native canvas visible',page.locator('canvas').is_visible())
  page.get_by_role('button',name='Choose a level',exact=True).click();shot('02-levels');page.get_by_role('button',name='▶ PLAY',exact=True).click()
  page.wait_for_function('document.querySelector("geometry-lite-game").game.world?.t>.20');check('Gesture unlocks audio',g('g.audio.ctx.state')=='running')
  page.keyboard.press('Space');page.wait_for_timeout(160);check('Actual keyboard jump',g('g.world.y<390 && g.world.jumps===1'))
  page.keyboard.press('Escape');t=g('g.world.t');page.wait_for_timeout(300);check('Pause freezes physics',g('g.world.t')==t);check('Pause stops music',g('!g.audio.playing'));shot('03-pause')
  page.get_by_role('button',name='Resume',exact=True).click();page.wait_for_timeout(150);check('Resume seeks audio and physics together',g('Math.abs(g.audio.now()-g.world.t)<.035'))
  page.get_by_role('button',name='Toggle audio').click();page.wait_for_timeout(150);check('Mute reaches output gain',g('g.settings.muted && g.audio.output.gain.value<.001'))
  page.get_by_role('button',name='Toggle audio').click();page.keyboard.press('KeyR');page.wait_for_timeout(100);check('Retry resets level',g('g.world.t<.4 && g.attempt===2'))
  page.wait_for_function('document.querySelector("geometry-lite-game").game.world.dead',timeout=10000);check('Real hazard kills idle player',g('g.world.deadObject!==null'));shot('04-death');a=g('g.attempt')
  page.wait_for_function('(a)=>document.querySelector("geometry-lite-game").game.attempt>a',arg=a);check('Automatic retry increments attempt',g('g.attempt')==a+1)
  page.keyboard.press('Escape');page.get_by_role('button',name='Level select',exact=True).click();page.get_by_role('button',name='◆ PRACTICE',exact=True).click();page.wait_for_timeout(300);page.keyboard.press('KeyZ');check('Manual safe checkpoint',g('g.checkpoints.length')==1)
  cp=g('g.checkpoints[0].t');page.wait_for_timeout(200);page.keyboard.press('KeyR');page.wait_for_timeout(100);check('Retry restores checkpoint time',cp<=g('g.world.t')<cp+.4)
  page.keyboard.press('KeyX');check('Checkpoint removal',g('g.checkpoints.length')==0)
  page.keyboard.press('Escape');page.get_by_role('button',name='Level select',exact=True).click();page.get_by_role('button',name='Back',exact=True).click()
  page.get_by_role('button',name='Customize character').click();page.get_by_role('button',name='Icon 3',exact=True).click();page.get_by_role('button',name='primary color 3',exact=True).click();shot('05-customize');check('Customization applies',g('g.settings.icon===2 && g.settings.primary===2'))
  page.reload();page.wait_for_timeout(300);check('Customization survives reload',g('g.settings.icon===2 && g.settings.primary===2'))
  page.get_by_role('button',name='Level editor',exact=True).click();page.get_by_role('textbox',name='Level name').fill('Neon Workshop');page.mouse.click(500,500);check('Editor places real object',g('g.custom.objects.length')==1)
  page.get_by_role('button',name='Undo',exact=True).click();check('Editor undo',g('g.custom.objects.length')==0);page.get_by_role('button',name='Redo',exact=True).click();check('Editor redo',g('g.custom.objects.length')==1)
  page.mouse.click(550,450);page.mouse.click(600,500);page.get_by_role('button',name='SPIKE',exact=True).click();page.mouse.click(710,530);shot('06-editor')
  with page.expect_download() as d:page.get_by_role('button',name='EXPORT',exact=True).click()
  path=OUT/'custom-level.json';d.value.save_as(path);check('Editor exports validated JSON',json.loads(path.read_text())['name']=='Neon Workshop')
  page.get_by_role('button',name='SAVE',exact=True).click();page.reload();page.wait_for_timeout(300);check('Editor persists on same origin',g('g.custom.objects.length')==4)
  page.get_by_role('button',name='Customize character').click();page.get_by_role('button',name='Icon 1',exact=True).click();page.get_by_role('button',name='primary color 1',exact=True).click();page.get_by_role('button',name='Back',exact=True).click()
  before=g('JSON.stringify(g.store)');page.get_by_role('button',name='Watch a full level').click();page.wait_for_function('document.querySelector("geometry-lite-game").game.world.t>4.1');shot('07-cube-gameplay')
  audio=page.evaluate('''async()=>{const a=document.querySelector('geometry-lite-game').game.audio;const dest=a.ctx.createMediaStreamDestination();a.output.connect(dest);const recorder=new MediaRecorder(dest.stream);const chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);const done=new Promise(resolve=>recorder.onstop=async()=>{const blob=new Blob(chunks,{type:recorder.mimeType});const b=new Uint8Array(await blob.arrayBuffer());let s='';for(const v of b)s+=String.fromCharCode(v);resolve({base64:btoa(s),mime:recorder.mimeType});});recorder.start();setTimeout(()=>recorder.stop(),3500);const data=await done;a.output.disconnect(dest);return data;}''')
  (OUT/'live-soundtrack.webm').write_bytes(base64.b64decode(audio['base64']));check('Live music recorded',len(audio['base64'])>8000,{'mime':audio['mime']})
  page.wait_for_function('document.querySelector("geometry-lite-game").game.world.t>17.4',timeout=25000);shot('08-ship-gameplay');check('Real-time ship section',g('g.world.mode')=='ship')
  page.wait_for_function('document.querySelector("geometry-lite-game").game.screen==="result"',timeout=45000);shot('09-complete');check('Full real-time level, collisions and all coins',g('g.world.won&&!g.world.dead&&g.world.coins===7'));check('Watch does not set player records',g('JSON.stringify(g.store)')==before)
  report['timing']=g('g.metrics');check('No lag-induced pause',report['timing']['pausesForLag']==0)
  rendered=page.evaluate('''async()=>{const b=await GeometryLiteNative.renderAudioPreview(GeometryLiteNative.makeLevel(0),10);const d=b.getChannelData(0);let peak=0,sum=0;const bytes=new Uint8Array(d.length*2),dv=new DataView(bytes.buffer);for(let i=0;i<d.length;i++){peak=Math.max(peak,Math.abs(d[i]));sum+=d[i]*d[i];dv.setInt16(i*2,Math.round(Math.max(-1,Math.min(1,d[i]))*32767),true);}let s='';for(const v of bytes)s+=String.fromCharCode(v);return {rms:Math.sqrt(sum/d.length),peak,sampleRate:b.sampleRate,pcm:btoa(s)};}''')
  with wave.open(str(OUT/'neon-dawn-10s.wav'),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rendered['sampleRate']);w.writeframes(base64.b64decode(rendered.pop('pcm')))
  report['audio']=rendered;check('Soundtrack non-silent, not clipped',rendered['rms']>.01 and rendered['peak']<.99,rendered)
  check('Three collision-enabled level solvers',page.evaluate('[0,1,2].map(i=>GeometryLiteNative.verifyLevel(GeometryLiteNative.makeLevel(i))).every(r=>r.won&&r.coins===7)'))
  mobile=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True);m=mobile.new_page();m.on('pageerror',lambda e:report['errors'].append(str(e)));load(m);m.screenshot(path=str(OUT/'10-mobile-portrait.png'))
  m.set_viewport_size({'width':844,'height':390});m.wait_for_timeout(300);m.get_by_role('button',name='Choose a level',exact=True).tap();m.wait_for_timeout(250);m.screenshot(path=str(OUT/'11-mobile-landscape-levels.png'))
  m.get_by_role('button',name='▶ PLAY',exact=True).tap();m.wait_for_timeout(350);m.touchscreen.tap(400,230);m.wait_for_timeout(130);check('Touch input jumps',g('g.world.jumps===1 && g.world.y<390',m));m.screenshot(path=str(OUT/'12-mobile-gameplay.png'))
  m.get_by_role('button',name='Pause',exact=True).tap();check('Touch pause works',g('g.screen',m)=='pause');mobile.close()
  check('No JavaScript errors',not report['errors'],report['errors']);check('No third-party game asset requests',all(u==url or 'favicon' in u or u.startswith('blob:') for u in requests),requests)
  g('g.destroy()');page.wait_for_timeout(100);check('Unmount closes audio',g('g.destroyed && g.audio.ctx.state==="closed"'));report['passed']=True
 finally:
  save_report();browser.close();server.shutdown()
print(json.dumps({'passed':report.get('passed',False),'checks':len(report['checks']),'url':url,'timing':report.get('timing'),'audio':report.get('audio')},indent=2))
