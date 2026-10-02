import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const root = process.cwd();
const build = path.join(root,'.presentation-build','dot-guide');
const out = path.join(root,'output','dot-guide');
const skill = 'C:/Users/Asus/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const python = 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_PYTHON=python;
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')));
const P=Presentation.create({slideSize:{width:1280,height:720}});
const C={paper:'#F6F4EE',ink:'#182321',muted:'#59635F',green:'#087D69',white:'#FFFFFF',dark:'#123D35',light:'#D9F4E6'};
const SRC={dot:'https://learn.chatgpt.com/docs/dots',start:'https://learn.chatgpt.com/docs/dots/getting-started',memory:'https://learn.chatgpt.com/docs/dots/tasks-and-memory',computer:'https://learn.chatgpt.com/docs/dots/computers-and-apps',control:'https://learn.chatgpt.com/docs/dots/controls',loop:'https://code.claude.com/docs/en/scheduled-tasks',goal:'https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex'};
const narration=[];
function text(s,t,x,y,w,h,size=30,color=C.ink,bold=false){const sh=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=t;sh.text.style={typeface:'Arial',fontSize:size,color,bold,autoFit:'none'};return sh;}
function slide(title,notes,refs=[],dark=false){const s=P.slides.add();s.background.fill=dark?C.dark:C.paper;const i=P.slides.items.length;const col=dark?C.white:C.ink;if(title)text(s,title,72,54,1136,104,48,col,true);text(s,String(i).padStart(2,'0'),1170,658,45,30,18,dark?C.light:C.muted);s.speakerNotes.textFrame.setText(notes+'\n\nSources (accessed 30 September 2026):\n'+refs.map(k=>SRC[k]||k).join('\n'));narration.push({title,notes,refs});return s;}
function label(s,t,x,y,w=330,dark=false){text(s,t,x,y,w,42,27,dark?C.light:C.green,true);}

await sharp(path.join(build,'official-dot.svg'),{density:600}).resize(700,700).png().toFile(path.join(build,'official-dot.png'));
const art=await fs.readFile(path.join(build,'official-dot.png'));

// 1. Cover
{
const s=slide('', 'Today we will choose between three ways of working with AI. Dot is useful when you want follow-through over time. A repeated check and a focused task are different needs. This presentation uses the built-in Claude Code command; a custom loop may behave differently.', ['dot','loop','goal']);
text(s,'Meet Dot',72,148,690,106,84,C.ink,true);
text(s,'An AI teammate for ongoing work',76,280,650,100,38);
text(s,'When to use Dot, Claude /loop,\nor a normal Codex chat',76,426,650,105,29,C.muted);
text(s,'Team guide · 30 September 2026',76,650,700,30,18,C.muted);
s.images.add({blob:art,contentType:'image/png',alt:'Official OpenAI dot character',fit:'contain',position:{left:815,top:170,width:345,height:345}});
s.speakerNotes.textFrame.setText(narration[0].notes+'\nSources: '+SRC.dot+'; '+SRC.loop+'; '+SRC.goal+'\nOfficial artwork: https://learn.chatgpt.com/images/codex/dots/default-dot.svg');
}
// 2. Definition
{
const s=slide('What Dot does','Think of an assistant who remembers the assignment and follows up between conversations. Dot can research, work with documents and data, and help build software. It can finish an individual task even while a broader responsibility continues. Availability is rolling out and depends on account and workspace access.',['dot']);
text(s,'You give it a responsibility.\nIt keeps work moving between conversations.',72,185,1100,134,43,C.ink,true);
label(s,'Keeps context',72,367);text(s,'Uses relevant memory\nand saved notes.',72,424,325,100,29);
label(s,'Takes next steps',461,367);text(s,'Works, follows up, and\ncan delegate tasks.',461,424,345,100,29);
label(s,'Brings you decisions',850,367);text(s,'Returns results and asks\nwhen your input is needed.',850,424,355,110,29);
text(s,'Its own cloud computer can work while your laptop is off.',72,593,1100,48,27,C.green);
}
// 3. Misconception
{
const s=slide('Two meanings of “loop”','The original verifier idea describes a custom repair loop: attempt, test, fix, repeat. It is useful, but it is not the definition of Claude Code’s built-in /loop. In current Claude Code, omitting an interval can let Claude choose the delay. Both approaches involve model judgment. Dot can use objective checks too.',['loop','memory']);
label(s,'Claude Code: built-in /loop',72,190,530);
text(s,'Repeats a prompt during\na running session.',72,250,535,115,38,C.ink,true);
text(s,'/loop 5m check the release build',72,396,545,72,26,C.green);
label(s,'Custom: repeat until verified',700,190,510);
text(s,'Tries a fix, runs a test,\nand retries if it fails.',700,250,510,115,38,C.ink,true);
text(s,'Example: fix a function until\nits agreed tests pass.',700,396,490,90,28,C.muted);
text(s,'“Has a test” versus “uses judgment” does not separate Dot from /loop.',72,573,1136,79,30,C.ink,true);
}
// 4. Native comparison
{
const s=slide('Choose by the work you want done','These are recommended defaults, not exclusive capabilities. A normal Codex task can investigate, edit and test within one request. Dot adds coordination and follow-up across work. For a difficult task with a measurable finish line, Codex Goals are another option.',['dot','loop','goal']);
const values=[['Need','Best starting point','Why'],['One answer, file, or code change','Normal Codex chat','Work directly on a specific result'],['Repeat a check in Claude','Claude /loop','Reuse the current session and tools'],['Follow changing work over days','Dot','Maintain context and follow through']];
const tb=s.tables.add({rows:4,columns:3,left:72,top:200,width:1136,height:355,columnWidths:[387,330,419],values});
tb.borders.assign({fill:'#D4DBD4',width:1,style:'solid'});
for(let r=0;r<4;r++){tb.rows[r].height=r===0?65:96;for(let c=0;c<3;c++){const cell=tb.getCell(r,c);cell.fill=r===0?C.dark:(r%2?C.white:'#EAF0E8');cell.text.style={typeface:'Arial',fontSize:27,color:r===0?C.white:C.ink,bold:r===0||c===1};}}
text(s,'A clear finish line? A normal task—or Codex Goal—may be enough.',72,601,1120,55,28,C.green);
}
// 5. Everyday example
{
const s=slide('One launch, three useful requests','Illustrative examples, assuming the needed tools are connected. The distinction is what you are delegating: a deliverable, a repeated check, or responsibility for follow-through. Dot could coordinate a code fix, but opening Codex directly is usually simpler when that fix is all you need.',['dot','loop','goal']);
label(s,'Codex chat',72,199,225);text(s,'“Fix the broken signup button and test it.”',326,190,877,85,34,C.ink,true);
label(s,'Claude /loop',72,350,225);text(s,'“Check the release build every five minutes.”',326,339,877,90,34,C.ink,true);
label(s,'Dot',72,501,225);text(s,'“Track launch blockers this week. Prepare updates\nand bring me decisions that need my input.”',326,490,877,125,34,C.ink,true);
}
// 6. Setup
{
const s=slide('Start working with Dot','In the desktop app, open the Your dot area if shown; official documentation describes setup in ChatGPT desktop or a desktop browser. Follow the introduction. Account availability varies. Computer access is optional, and messaging access does not automatically connect files or apps.',['start','computer','dot']);
const rows=[['1','Open your dot','Use the desktop sidebar or ChatGPT on a desktop browser.'],['2','Connect the sources','Add the apps and files needed for this responsibility.'],['3','Give a specific assignment','Name the result, timing, updates, and decisions you keep.'],['4','Review the first result','Correct missing context before adding more work.']];
rows.forEach((r,i)=>{let y=181+i*112;text(s,r[0],72,y,60,65,45,C.green,true);text(s,r[1],155,y,1000,48,32,C.ink,true);text(s,r[2],155,y+46,1000,50,27,C.muted);});
}
// 7. Example prompt
{
const s=slide('A first Dot assignment', 'This is an illustrative team prompt. Replace the sources with material your dot can access. After it replies, check the saved schedule and inspect the first checklist. Refine what counts as a blocker using feedback. This does not mean the underlying model is retrained.',['start','memory'],true);
text(s,'Keep our product demo ready for Friday.',72,176,1110,66,43,C.white,true);
text(s,'Use the demo checklist and connected project channel.\nCheck each weekday at 9 AM Asia/Tehran until Friday.\nUpdate the checklist when a deadline or owner changes.\nTell me here only if the demo is at risk or you need a decision.\nDraft team messages for my review. Confirm the schedule.',72,287,1136,260,31,C.white);
text(s,'Result + sources + timing + notification rule + approval boundary',72,597,1110,54,26,C.light);
}
// 8. Codex placement
{
const s=slide('Dot and Codex work together','Dot can create and coordinate tasks, including coding tasks. New cloud coding work needs a configured Codex cloud environment. Existing tasks stay on their original environment. A delegated task has its own conversation; it does not automatically inherit every Dot conversation.',['memory','computer','goal']);
text(s,'Use Codex directly for a focused edit, bug fix, or review.\nUse Dot when you want follow-up across tasks and time.',72,179,1136,118,35,C.ink,true);
label(s,'Code on your computer',72,370,510);text(s,'Connect the computer to Dot.\nKeep it online with the app open.',72,431,530,109,31);
label(s,'Code in the cloud',700,370,510);text(s,'Set up a Codex cloud environment\nwith the repository and tools.',700,431,505,109,31);
text(s,'Long task, clear end point? Use a Codex Goal with evidence of success.',72,596,1140,58,27,C.green);
}
// 9. Control
{
const s=slide('Review, steer, and stop the work','Built-in review and app permissions apply. The same rules can permit an action, ask for approval, or require a step from you. A completion message is not proof that an output is correct: inspect it. Stopping work does not reverse completed changes.',['control']);
label(s,'See the work',72,191,335);text(s,'Profile → Activity\nOpen the task and\nreview its results.',72,254,330,160,32);
label(s,'Change direction',461,191,335);text(s,'Give feedback in chat.\nState what matters\nand what needs approval.',461,254,350,180,32);
label(s,'End recurring work',850,191,355);text(s,'Open Scheduled.\nDisable or delete\nthe saved schedule.',850,254,355,160,32);
text(s,'Pause affects the main task.\nStop delegated tasks and schedules separately.',72,515,1136,110,36,C.ink,true);
}
// 10. Takeaway and exercise
{
const s=slide('Which one will you use?', 'Ask the room to choose: “Summarize this document” → normal chat. “Check the build while I work” → /loop. “Keep next week’s client demo on track” → Dot. These recommendations are based on scope and follow-up, not whether a result is subjective. For fixed-interval /loop, ask Claude to cancel the job when finished; recurring jobs expire after seven days in current docs. Re-check product documentation before reusing this deck after feature changes.',['loop','dot','goal'],true);
text(s,'One result now',72,196,680,65,45,C.white,true);text(s,'Codex chat',875,204,330,59,36,C.light,true);
text(s,'Repeat this check',72,331,740,65,45,C.white,true);text(s,'Claude /loop',875,339,330,59,36,C.light,true);
text(s,'Keep this work moving',72,466,780,65,45,C.white,true);text(s,'Dot',875,474,330,59,36,C.light,true);
text(s,'Try it: “Keep next week’s client demo on track.”',72,613,1120,53,29,C.light);
}

await fs.writeFile(path.join(build,'presentation.json'),JSON.stringify(P.toProto()));
await (await PresentationFile.exportPptx(P)).save(path.join(build,'candidate.pptx'));
console.log('Draft exported');
const finalPath=path.join(out,'Dot-Loop-Codex-Team-Guide.pptx');
const result=await finalizePresentation({workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),finalPath,pythonExecutable:python,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','4'],requiredNativeTableOwnerSlides:[4],fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation.json')});
console.log(JSON.stringify(result));
for(let i=0;i<P.slides.items.length;i++){const s=P.slides.items[i];const png=await P.export({slide:s,format:'png',scale:1});await fs.writeFile(path.join(build,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));console.log('Rendered '+(i+1));}
await fs.writeFile(path.join(build,'speaker-guide.md'),narration.map((n,i)=>`## ${i+1}. ${n.title||'Meet Dot'}\n\n${n.notes}\n\n${n.refs.map(k=>SRC[k]||k).join('\n')}`).join('\n\n'));
