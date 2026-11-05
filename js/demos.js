(() => {
    const definitions = {
        agents:{title:'Turn a CV Into a Recruiter Summary',goal:'See a sample CV become a clear, explainable recruiter summary.',options:['Backend CV','Frontend CV'],steps:['Receive the CV','Read the Skills','Review the Match'],icons:['▤','✦','✓'],status:['Choose a sample CV, then play its story.','Reading the candidate’s experience…','Pulling out the skills relevant to a role…'],results:['Backend skills found. The recruiter gets a role suggestion and its reason.','Frontend skills found. The recruiter gets a role suggestion and its reason.']},
        pipeline:{title:'One Document, Several Useful Results',goal:'AI assistants handle different parts of the same task and combine their results.',options:['Document Attached','No Document'],steps:['Receive a Document','Complete the Tasks','Deliver the Summary'],icons:['▤','⚙','✓'],status:['Choose what arrives, then watch the assistants work.','Checking whether a document was attached…','Reading skills, comparing roles, and preparing a summary…'],results:['The tasks are complete. One review-ready summary brings the results together.','No file arrived. The system asks for a document instead of producing a misleading summary.']},
        stack:{title:'Give Your Team a Useful Dashboard',goal:'A single screen makes tasks and issues easier to see and act on.',options:['Load Tasks','Show an Issue'],steps:['Open the Screen','Collect the Updates','See What Needs Action'],icons:['▣','↻','✓'],status:['Choose an example and load the sample dashboard.','Requesting the latest sample records…','Organizing the updates into a readable view…'],results:['The team can see which tasks are ready for review.','An issue is highlighted so the team knows what needs attention.']},
        monitor:{title:'Spot a Problem Before It Gets Lost',goal:'Watch a sample AI workflow appear in the monitoring dashboard.',options:['Successful Run','Missing File'],steps:['A Workflow Starts','Updates Arrive','Inspect the Outcome'],icons:['▤','↻','✓'],status:['Send a sample event to see the monitoring view update.','A document-processing event arrives…','The dashboard receives status and log updates…'],results:['The workflow completed. Its activity and result are visible in one place.','The missing document is clearly flagged, with a useful next action.']},
        healthcare:{title:'Help a Caller Reach the Right Next Step',goal:'Follow an example conversation and see the result on the patient-support screen.',options:['Book an Appointment','Speak to a Person'],steps:['The Caller Asks','Understand the Request','Offer the Next Step'],icons:['◉','✦','✓'],status:['Choose what the caller needs, then play the conversation.','Listening to the caller’s request…','Recognizing the request and collecting context…'],results:['An appointment request is prepared for an availability check. This example books nothing.','The conversation is handed to a person with the caller’s request attached.']},
        deploy:{title:'Improve the Product Without Interrupting Users',goal:'A checked update goes live; a broken update leaves the working version untouched.',options:['Healthy Update','Update With a Bug'],steps:['Users Are Connected','Check the Update','Keep the Service Working'],icons:['◉','⚙','✓'],status:['Choose an update and see what happens to the people using the product.','The new version is being checked…','Deciding whether the update is safe to release…'],results:['The update passed. Visitors now use the new version.','The update failed its checks. Visitors stay on the working version.']}
    };
    const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    const tag=(text,tone='')=>'<span class="example-badge '+tone+'">'+escape(text)+'</span>';
    const row=(label,value,tone='')=>'<div class="example-row"><span>'+escape(label)+'</span>'+tag(value,tone)+'</div>';
    const empty=text=>'<div class="example-empty"><span aria-hidden="true">◇</span><p>'+escape(text)+'</p></div>';
    const panel=(title,body)=>'<section class="example-panel"><h5>'+escape(title)+'</h5>'+body+'</section>';
    function cv(p,c){
        const skills=c?['React','CSS','JavaScript']:['Python','AWS','SQL'];
        const role=c?'Frontend Developer':'Backend Developer';
        return panel('Sample CV','<p class="example-document-title">Software Developer</p><p class="example-document-copy">Experience building '+(c?'web interfaces with React and JavaScript.':'APIs and cloud services with Python and AWS.')+'</p><div class="example-tags">'+skills.map(s=>tag(s,p>=2?'good':'')).join('')+'</div>')+
            panel('Recruiter View',p===3?'<div class="example-answer"><span class="example-check" aria-hidden="true">✓</span><div><strong>'+role+'</strong><p>'+skills.slice(0,2).join(' and ')+' match this sample role.</p></div></div><p class="example-footnote">A recruiter reviews the recommendation.</p>':empty(p?'Reading skills and comparing roles…':'A summary will appear here.'));
    }
    function workflow(p,c){
        const tasks=['Read the skills','Compare suitable roles','Write the summary'];
        return panel('Incoming Request',row('CV document',c?'Not attached':'candidate.pdf',c?'warn':'')+'<p class="example-document-copy">Prepare a candidate summary for the recruiter.</p>')+
            panel('AI Assistants',tasks.map((t,i)=>row(t,p===3?(c?'Waiting for file':'Complete'):p===2?(c?'Waiting for file':i===0?'Complete':'Working'):p===1?'Queued':'Not started',p>=2&&!c?'good':c&&p===3?'warn':'')).join(''))+
            (p===3?'<div class="example-outcome '+(c?'warn':'good')+'"><strong>'+(c?'Please attach a CV.':'Summary ready for review.')+'</strong><p>'+(c?'No summary is generated without a source document.':'Backend experience, extracted skills, and a role suggestion are brought together.')+'</p></div>':'');
    }
    function dashboard(p,c,monitor){
        const ready=p===3;
        const heading=monitor?'AI Workflow Monitor':'Team Dashboard';
        return '<div class="example-appbar"><span class="example-app-dot"></span><strong>'+heading+'</strong>'+tag('Sample Data')+'</div>'+
            '<div class="example-metrics"><div><b>'+(ready?'3':'—')+'</b><span>Events Received</span></div><div><b>'+(ready?(c?'1':'0'):'—')+'</b><span>Needs Attention</span></div></div>'+
            '<div class="example-chart" aria-label="Illustrative activity bars">'+[35,65,45,82,60,95,70].map((v,i)=>'<i style="--height:'+(p>=2?v:8)+'%;--delay:'+i*.08+'s"></i>').join('')+'</div>'+
            panel('Recent Activity',p<2?empty(p?'Loading updates…':'No updates loaded yet.'):row('Upload event','Received','')+row('Skills extracted',ready&&!c?'Complete':c?'Blocked':'Processing',c?'warn':'good')+row('Recruiter summary',ready?(c?'File required':'Ready to review'):'Pending',ready&&c?'warn':ready?'good':''))+
            (ready&&c?'<div class="example-outcome warn"><strong>A source document is missing.</strong><p>Open the record and attach the file before retrying.</p></div>':'');
    }
    function conversation(p,c){
        return '<div class="example-chat"><div class="chat-message support">Hello. How can I help you?</div>'+
            (p>=1?'<div class="chat-message caller">'+(c?'I’d like to speak to someone.':'I’d like to book an appointment.')+'</div>':'')+
            (p>=2?'<div class="chat-message support">'+(c?'I’ll pass your request to a member of the team.':'What day and appointment type would you prefer?')+'</div>':'')+'</div>'+
            (p===3?panel(c?'Support Handoff':'Appointment Request',row(c?'Caller’s request':'Preferred day',c?'Human assistance':'To be confirmed')+row(c?'Next step':'Next step',c?'Join the agent queue':'Check availability','good')+'<p class="example-footnote">'+(c?'The agent receives the conversation context.':'Availability and caller details must be confirmed first.')+'</p>'):empty('The next step will appear after the request is understood.'));
    }
    function release(p,c){
        const released=p===3&&!c, blocked=p===3&&c;
        return '<div class="example-visitor"><span aria-hidden="true">◉</span>People Are Using the Product</div><div class="example-release-grid">'+
            panel('Current Version',tag(released?'Previous version':'Serving visitors',released?'':'good')+'<div class="mini-page"><i></i><i></i><i></i></div>')+
            panel('New Version',tag(blocked?'Update blocked':released?'Now live':p?'Checking…':'Ready to check',blocked?'warn':released?'good':'')+'<div class="mini-page new"><i></i><i></i><i></i></div>')+'</div>'+
            '<div class="example-traffic '+(released?'released':'')+'"><span aria-hidden="true">→</span> Visitors go to the '+(released?'new':'current')+' version.</div>'+
            (p>=2?row('Update checks',c?'Failed':'Passed',c?'warn':'good'):'')+
            (blocked?'<div class="example-outcome warn"><strong>The working version stays live.</strong><p>The bug can be fixed without interrupting visitors.</p></div>':'');
    }
    const instances=new Map();
    function mount(target,key){
        instances.get(target)?.stop();
        const d=definitions[key];target.className='visual-demo example-demo example-'+key;target.removeAttribute('role');target.removeAttribute('aria-label');
        target.innerHTML='<div class="example-label">Interactive Example · Sample Data</div><h4>'+d.title+'</h4><p class="example-goal">'+d.goal+'</p>'+
            '<div class="example-steps" role="group" aria-label="'+d.title+': Sequence">'+d.steps.map((s,i)=>'<button type="button" data-step="'+[0,2,3][i]+'" aria-pressed="'+!i+'"><span class="example-step-icon" aria-hidden="true">'+d.icons[i]+'</span><span>'+s+'</span></button>').join('')+'</div>'+
            '<div class="example-preview" aria-label="Sample product screen"></div>'+
            '<div class="example-choices" role="group" aria-label="Choose an Example">'+d.options.map((v,i)=>'<button type="button" data-choice="'+i+'" aria-pressed="'+!i+'">'+v+'</button>').join('')+'</div>'+
            '<button type="button" class="example-play">Play the Example <span aria-hidden="true">▶</span></button><p class="example-status" role="status" aria-live="polite"></p>';
        let phase=0,choice=0,timers=[];
        const play=target.querySelector('.example-play'),status=target.querySelector('.example-status'),preview=target.querySelector('.example-preview');
        const stop=()=>{timers.forEach(clearTimeout);timers=[];play.disabled=false;};
        function paint(p){
            phase=p;target.dataset.phase=p;target.dataset.choice=choice;
            target.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.step)===(p===1?2:p))));
            preview.innerHTML=key==='agents'?cv(p,choice):key==='pipeline'?workflow(p,choice):key==='healthcare'?conversation(p,choice):key==='deploy'?release(p,choice):dashboard(p,choice,key==='monitor');
            status.textContent=p===3?d.results[choice]:(key==='pipeline'&&choice&&p===2?'No document was attached. The assistants are waiting for a file.':d.status[p]);
            if(p===3){play.disabled=false;play.firstChild.textContent='Replay the Example ';}
        }
        const reset=()=>{stop();play.firstChild.textContent='Play the Example ';paint(0);};
        target.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{stop();play.firstChild.textContent='Play the Example ';paint(Number(b.dataset.step));}));
        target.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{choice=Number(b.dataset.choice);target.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));reset();}));
        play.addEventListener('click',()=>{reset();play.disabled=true;paint(1);if(matchMedia('(prefers-reduced-motion: reduce)').matches){paint(3);return;}timers=[setTimeout(()=>paint(2),1200),setTimeout(()=>paint(3),2800)];});
        reset();instances.set(target,{target,stop,reset});
    }
    [['.orbit-system','agents'],['.stack-system','stack'],['.deployment-system','deploy'],['.pipeline-scene','pipeline'],['.healthcare-scene','healthcare']].forEach(([selector,key])=>document.querySelectorAll(selector).forEach(el=>mount(el,key)));
    const caseScene=document.createElement('div');document.querySelector('.dialog-copy').prepend(caseScene);
    const projectDialog=document.querySelector('[data-project-dialog]');
    new MutationObserver(()=>{if(projectDialog.open)mount(caseScene,{resume:'agents',agents:'pipeline',contact:'healthcare',monitoring:'monitor'}[projectDialog.dataset.variant]||'stack');}).observe(projectDialog,{attributes:true,attributeFilter:['open']});
    document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>instances.forEach(i=>{if(dialog.contains(i.target))i.reset();})));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)instances.forEach(i=>i.reset());});
})();