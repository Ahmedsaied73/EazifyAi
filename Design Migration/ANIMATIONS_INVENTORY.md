# ANIMATIONS_INVENTORY.md — machine-generated list of every motion rule

Generated with `node scripts/audit-motion.mjs design-reference/app/src/styles.css` run on the site layer (CSS lines 115 to the end, 636 lines). Result: **228 rows, 39 keyframes, 13 `prefers-reduced-motion` blocks**.

To regenerate or compare against your port:

```bash
sed -n '115,$p' design-reference/app/src/styles.css > /tmp/site-layer.css
node scripts/audit-motion.mjs /tmp/site-layer.css > ANIMATIONS_INVENTORY.md   # regenerate
node scripts/audit-motion.mjs /tmp/site-layer.css app/globals.css             # must print OK
```

The table lists only motion-related declarations (`animation*`, `transition*`, `transform*`, `translate`, `rotate`, `scale`, `will-change`, `scroll-behavior`), every `@keyframes`, every `@property`, and every declaration inside `prefers-reduced-motion` blocks. The full CSS (colors, layout) is in the file itself; this table is the motion contract. See `ANIMATIONS.md` for the explanation of each row.

| context | selector | motion declarations |
|---|---|---|
| - | `body` | `transition:background .25s,color .25s` |
| - | `.ez-m` | `animation:ez-rise .26s ease-out both` |
| - | `.ez-dots i` | `animation:ez-dot 1s infinite ease-in-out` |
| - | `.ez-dots i:nth-child(2)` | `animation-delay:.15s` |
| - | `.ez-dots i:nth-child(3)` | `animation-delay:.3s` |
| - | `.ez-bar i` | `transition:width .4s ease-out` |
| - | `.ez-fresh` | `animation:ez-flash 1.4s ease-out` |
| - | `@keyframes ez-rise` | `frames: from{transform:translateY(6px);opacity:.01}to{transform:none;opacity:1}` |
| - | `@keyframes ez-dot` | `frames: 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-3px)}` |
| - | `@keyframes ez-flash` | `frames: from{background:rgba(120,169,204,.25)}to{background:transparent}` |
| reduced | `.ez-m,.ez-dots i,.ez-fresh` | `animation:none` |
| reduced | `.ez-bar i,body` | `transition:none` |
| - | `.ez-prog` | `transform:scaleX(0)`<br>`transform-origin:left` |
| - | `[dir="rtl"] .ez-prog` | `transform-origin:right` |
| - | `.rv` | `transform:translateY(32px)`<br>`transition:transform .8s cubic-bezier(.2,.7,.2,1)`<br>`transition-delay:var(--d,0s)` |
| - | `.rv.in` | `transform:none` |
| - | `.lg *` | `transform-box:fill-box`<br>`transform-origin:center` |
| - | `.lg-a .lg-h` | `animation:lg-up .9s cubic-bezier(.2,.8,.2,1) both,lg-float 5s ease-in-out .9s infinite` |
| - | `.lg-a .lg-l` | `animation:lg-l .9s .15s cubic-bezier(.2,.8,.2,1) both,lg-float 5s ease-in-out 1.05s infinite` |
| - | `.lg-a .lg-r` | `animation:lg-r .9s .15s cubic-bezier(.2,.8,.2,1) both,lg-float 5s ease-in-out 1.05s infinite` |
| - | `.lg-a .lg-s` | `animation:lg-pop .9s .5s cubic-bezier(.2,1.4,.4,1) both,lg-pulse 3.2s ease-in-out 1.4s infinite` |
| - | `@keyframes lg-up` | `frames: from{transform:translateY(40px);opacity:.01}` |
| - | `@keyframes lg-l` | `frames: from{transform:translateX(-40px);opacity:.01}` |
| - | `@keyframes lg-r` | `frames: from{transform:translateX(40px);opacity:.01}` |
| - | `@keyframes lg-pop` | `frames: from{transform:scale(.2) rotate(-90deg);opacity:.01}` |
| - | `@keyframes lg-float` | `frames: 50%{transform:translateY(-6px)}` |
| - | `@keyframes lg-pulse` | `frames: 50%{transform:scale(1.2)}` |
| - | `.ez-orb` | `animation:ez-drift 16s ease-in-out infinite alternate` |
| - | `.ez-o2` | `animation-duration:20s`<br>`animation-direction:alternate-reverse` |
| - | `@keyframes ez-drift` | `frames: to{transform:translate3d(40px,-30px,0)}` |
| - | `.ez-w` | `animation:ez-up .8s cubic-bezier(.2,.8,.2,1) both`<br>`animation-delay:calc(var(--i) * 70ms + 700ms)` |
| - | `@keyframes ez-up` | `frames: from{transform:translateY(28px);opacity:.01}` |
| - | `.ez-first .ez-sub` | `animation:ez-up .8s 1.6s cubic-bezier(.2,.8,.2,1) both` |
| - | `.ez-cue` | `animation:ez-up .8s 2.2s both` |
| - | `.ez-cue i::after` | `animation:ez-wheel 1.6s ease-in-out infinite` |
| - | `@keyframes ez-wheel` | `frames: 60%{transform:translateY(10px)}` |
| - | `.ez-step` | `animation:ez-up .5s cubic-bezier(.2,.8,.2,1) both` |
| - | `.ez-opt` | `transition:transform .2s` |
| - | `.ez-opt:hover` | `transform:translateY(-2px)` |
| - | `.ez-dotsrow i` | `transition:width .3s,background .3s` |
| - | `.ez-float` | `transform:translateY(140px)`<br>`transition:transform .5s cubic-bezier(.2,.8,.2,1)` |
| - | `.ez-float.on` | `transform:none` |
| reduced | `.lg *,.ez-orb,.ez-w,.ez-first .ez-sub,.ez-cue,.ez-cue i::after,.ez-step` | `animation:none!important` |
| reduced | `.rv` | `transform:none`<br>`transition:none` |
| reduced | `.ez-float` | `transition:none` |
| - | `.ez-av::before,.ez-ring::before` | `animation:ez-spin 6s linear infinite` |
| - | `@keyframes ez-spin` | `frames: to{transform:rotate(360deg)}` |
| - | `.ez-ping` | `animation:ez-ping 1s ease-out both` |
| - | `@keyframes ez-ping` | `frames: from{transform:scale(.6);opacity:.8}to{transform:scale(2);opacity:0}` |
| - | `.ez-burst i` | `animation:ez-fly 1.1s cubic-bezier(.1,.8,.3,1) both` |
| - | `@keyframes ez-fly` | `frames: from{transform:rotate(var(--a)) translateX(10px) scale(1)}to{transform:rotate(var(--a)) translateX(150px) scale(.2);opacity:0}` |
| - | `.ez-str i` | `transition:background .3s` |
| - | `.ez-ring::before` | `animation-duration:8s` |
| - | `.ez-tag` | `animation:ez-pop .5s cubic-bezier(.2,1.4,.4,1) both`<br>`animation-delay:calc(var(--i) * 120ms)` |
| - | `@keyframes ez-pop` | `frames: from{transform:scale(.5);opacity:.01}` |
| - | `.ez-conv` | `animation:ez-up .5s cubic-bezier(.2,.8,.2,1) both`<br>`animation-delay:calc(var(--i) * 80ms)` |
| - | `.ez-lockic` | `animation:ez-wig 3s ease-in-out infinite` |
| - | `@keyframes ez-wig` | `frames: 0%,70%,100%{transform:rotate(0)}75%{transform:rotate(-12deg)}85%{transform:rotate(10deg)}92%{transform:rotate(-6deg)}` |
| reduced | `.ez-av::before,.ez-ring::before,.ez-ping,.ez-tag,.ez-conv,.ez-lockic` | `animation:none!important` |
| reduced | `.ez-burst` | `display:none` |
| - | `.ez-core` | `animation:ez-breathe 4s ease-in-out infinite` |
| - | `@keyframes ez-breathe` | `frames: 50%{transform:scale(1.25);opacity:.7}` |
| - | `.ez-rx` | `animation:ez-spin 22s linear infinite` |
| - | `.ez-rx.r2` | `animation-duration:34s`<br>`animation-direction:reverse` |
| - | `.ez-rx.r3` | `animation-duration:48s` |
| - | `.ez-bub` | `animation:ez-bob 5s ease-in-out infinite` |
| - | `.ez-fchip` | `animation:ez-bob 6s ease-in-out infinite` |
| - | `.ez-fchip.c1` | `animation-delay:-2s` |
| - | `.ez-fchip.c2` | `animation-delay:-4s` |
| - | `.ez-fchip.c3` | `animation-delay:-1s` |
| - | `@keyframes ez-bob` | `frames: 50%{transform:translateY(-10px)}` |
| - | `.ez-fl input` | `transition:box-shadow .2s` |
| - | `.ez-fl label` | `transform-origin:left top`<br>`transition:transform .2s,color .2s` |
| - | `[dir="rtl"] .ez-fl label` | `transform-origin:right top` |
| - | `.ez-fl input:focus+label,.ez-fl input:not(:placeholder-shown)+label` | `transform:translateY(-10px) scale(.78)` |
| - | `.ez-eye` | `transform:translateY(-50%)` |
| - | `.ez-spinner` | `animation:ez-spin .7s linear infinite` |
| - | `.ez-check path` | `animation:ez-draw .5s .1s ease-out forwards` |
| - | `@keyframes ez-draw` | `frames: to{stroke-dashoffset:0}` |
| - | `.ez-shake` | `animation:ez-shk .45s` |
| - | `@keyframes ez-shk` | `frames: 20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}` |
| reduced | `.ez-core,.ez-rx,.ez-bub,.ez-fchip,.ez-shake,.ez-spinner` | `animation:none!important` |
| reduced | `.ez-check path` | `animation:none`<br>`stroke-dashoffset:0` |
| reduced | `.ez-fl label` | `transition:none` |
| - | `.ez-jr` | `animation:ez-up .7s cubic-bezier(.2,.8,.2,1) both` |
| - | `.ez-stp b` | `transition:width .6s cubic-bezier(.2,.8,.2,1)` |
| - | `.ez-sn i` | `transition:background .3s,transform .3s` |
| - | `.ez-sn.on i` | `transform:scale(1.12)` |
| - | `.ez-bc circle` | `animation:ez-d302 .8s ease-out forwards` |
| - | `.ez-bc path` | `animation:ez-d70 .5s .7s ease-out forwards` |
| - | `@keyframes ez-d302` | `frames: to{stroke-dashoffset:0}` |
| - | `@keyframes ez-d70` | `frames: to{stroke-dashoffset:0}` |
| - | `.ez-bc .ez-burst` | `animation:none` |
| - | `.ez-bc .ez-burst i` | `animation-delay:.8s` |
| - | `.ez-ch` | `animation:ez-up .6s cubic-bezier(.2,.8,.2,1) both`<br>`animation-delay:calc(.9s + var(--i) * 70ms)` |
| - | `.ez-trk .ez-ch` | `animation-delay:calc(var(--i) * 70ms)` |
| - | `.ez-tl li` | `animation:ez-up .6s cubic-bezier(.2,.8,.2,1) both`<br>`animation-delay:calc(var(--i) * 180ms)` |
| - | `.ez-tl li::after` | `transform-origin:top`<br>`animation:ez-grow .5s both`<br>`animation-delay:calc(var(--i) * 180ms + 300ms)` |
| - | `@keyframes ez-grow` | `frames: from{transform:scaleY(0)}` |
| - | `.ez-tl .cur .ez-node::after` | `animation:ez-ping 1.6s ease-out infinite` |
| - | `.ez-pdot` | `animation:ez-pd 1.4s ease-in-out infinite` |
| - | `@keyframes ez-pd` | `frames: 50%{transform:scale(1.6);opacity:.5}` |
| reduced | `.ez-jr,.ez-bc circle,.ez-bc path,.ez-ch,.ez-tl li,.ez-tl li::after,.ez-tl .cur .ez-node::after,.ez-pdot` | `animation:none!important` |
| reduced | `.ez-bc circle,.ez-bc path` | `stroke-dashoffset:0` |
| reduced | `.ez-bc .ez-burst` | `display:none` |
| - | `.ez-sw i` | `transition:background .25s` |
| - | `.ez-sw i::after` | `transition:transform .25s cubic-bezier(.2,1.2,.4,1)` |
| - | `.ez-sw[aria-checked="true"] i::after` | `transform:translateX(20px)` |
| - | `[dir="rtl"] .ez-sw[aria-checked="true"] i::after` | `transform:translateX(-20px)` |
| - | `.ez-bell.ring svg` | `animation:ez-ring 1.2s ease-in-out`<br>`transform-origin:50% 0` |
| - | `@keyframes ez-ring` | `frames: 0%,100%{transform:rotate(0)}15%{transform:rotate(16deg)}30%{transform:rotate(-14deg)}45%{transform:rotate(10deg)}60%{transform:rotate(-8deg)}75%{transform:rotate(4deg)}` |
| - | `.ez-badge` | `animation:ez-pop .4s cubic-bezier(.2,1.4,.4,1) both` |
| - | `.ez-npanel` | `animation:ez-up .3s cubic-bezier(.2,.8,.2,1) both` |
| - | `.ez-npanel li` | `animation:ez-up .4s cubic-bezier(.2,.8,.2,1) both` |
| - | `.ez-req` | `animation:ez-up .5s cubic-bezier(.2,.8,.2,1) both`<br>`animation-delay:calc(var(--i) * 80ms)`<br>`transition:transform .2s` |
| - | `.ez-req:hover` | `transform:translateY(-2px)` |
| reduced | `.ez-bell.ring svg,.ez-badge,.ez-npanel,.ez-npanel li,.ez-req` | `animation:none!important` |
| reduced | `.ez-sw i,.ez-sw i::after` | `transition:none` |
| - | `@property --p` | `syntax:"<number>";inherits:false;initial-value:0` |
| - | `.ez-tab` | `transition:background .2s,color .2s` |
| - | `.ez-pane` | `animation:ez-up .5s cubic-bezier(.2,.8,.2,1) both` |
| - | `.ez-li` | `animation:ez-up .45s cubic-bezier(.2,.8,.2,1) both`<br>`transition:transform .2s` |
| - | `.ez-li:hover` | `transform:translateY(-2px)` |
| - | `.ez-det` | `animation:ez-up .4s both` |
| - | `.ez-meter` | `transition:--p .9s ease-out`<br>`animation:ez-m .9s ease-out` |
| - | `@keyframes ez-m` | `frames: from{--p:0}` |
| - | `.ez-idea` | `animation:ez-up .5s cubic-bezier(.2,.8,.2,1) both` |
| - | `.ez-ev` | `animation:ez-pop .4s cubic-bezier(.2,1.4,.4,1) both` |
| - | `.ez-kpi` | `animation:ez-up .5s both` |
| - | `.ez-line` | `animation:ez-dl 1.6s ease-out forwards` |
| - | `@keyframes ez-dl` | `frames: to{stroke-dashoffset:0}` |
| - | `.ez-area` | `animation:ez-fade 1.2s .6s both` |
| - | `@keyframes ez-fade` | `frames: from{opacity:0}` |
| - | `.ez-dot2` | `transform-box:fill-box`<br>`transform-origin:center`<br>`animation:ez-pop .4s cubic-bezier(.2,1.4,.4,1) both` |
| - | `.ez-b2 i` | `transform-origin:left`<br>`animation:ez-gx .9s cubic-bezier(.2,.8,.2,1) both` |
| - | `[dir="rtl"] .ez-b2 i` | `transform-origin:right` |
| - | `@keyframes ez-gx` | `frames: from{transform:scaleX(0)}` |
| reduced | `.ez-pane,.ez-li,.ez-det,.ez-meter,.ez-idea,.ez-ev,.ez-kpi,.ez-line,.ez-area,.ez-dot2,.ez-b2 i` | `animation:none!important` |
| reduced | `.ez-line` | `stroke-dashoffset:0` |
| no-preference | `html` | `scroll-behavior:smooth` |
| - | `.ez-meet` | `animation:ez-up .8s 1.9s cubic-bezier(.2,.8,.2,1) both`<br>`transition:transform .2s` |
| - | `.ez-meet:hover` | `transform:translateY(-2px)` |
| - | `.ez-ping2` | `animation:ez-ping 1s ease-out both` |
| - | `.ez-live` | `animation:ez-pd 1.6s ease-in-out infinite` |
| - | `.ez-dm` | `transform:translateY(18px) scale(.94)`<br>`transition:transform .5s cubic-bezier(.2,1.2,.4,1),opacity .35s` |
| - | `.ez-dm.on` | `transform:none` |
| - | `.ez-fill` | `animation:ez-up .5s cubic-bezier(.2,.8,.2,1) both` |
| - | `.ez-dsucc` | `animation:ez-pop .5s cubic-bezier(.2,1.4,.4,1) both` |
| - | `.ez-dcta` | `transform:translateY(16px) scale(.9)`<br>`transition:transform .5s cubic-bezier(.2,1.4,.4,1),opacity .3s` |
| - | `.ez-dcta.on` | `transform:none` |
| - | `.ez-proc b` | `transition:width .8s cubic-bezier(.2,.8,.2,1)` |
| - | `.ez-pn i` | `transition:background .4s,transform .4s` |
| - | `.ez-pn.on i` | `transform:scale(1.1)` |
| - | `.ez-rep` | `transition:opacity .3s` |
| reduced | `.ez-dm` | `opacity:1`<br>`transform:none`<br>`transition:none` |
| reduced | `.ez-dcta,.ez-rep` | `opacity:1`<br>`transform:none`<br>`pointer-events:auto`<br>`transition:none` |
| reduced | `.ez-meet,.ez-ping2,.ez-live,.ez-fill,.ez-dsucc` | `animation:none!important` |
| reduced | `.ez-dsucc .ez-burst` | `display:none` |
| reduced | `.ez-pn i,.ez-proc b` | `transition:none` |
| - | `.ez-demo-grid` | `transform:perspective(1400px) translateY(calc((1 - var(--e,1)) * 56px)) rotateX(calc((1 - var(--e,1)) * 12deg))`<br>`transform-origin:50% 100%`<br>`will-change:transform` |
| media(max-width:879px) | `.ez-demo-grid` | `transform:perspective(1000px) translateY(calc((1 - var(--e,1)) * 36px)) rotateX(calc((1 - var(--e,1)) * 8deg))` |
| reduced | `.ez-demo-grid` | `transform:none`<br>`will-change:auto` |
| - | `.ez-resume` | `animation:ez-up .5s cubic-bezier(.2,.8,.2,1) both` |
| - | `.ez-qp i` | `transition:background .4s,width .4s` |
| - | `.ez-qp i.c` | `animation:ez-pd 1.6s ease-in-out infinite` |
| - | `.ez-back` | `animation:ez-pop .4s cubic-bezier(.2,1.4,.4,1) both` |
| - | `.ez-assure span` | `animation:ez-up .6s cubic-bezier(.2,.8,.2,1) both`<br>`animation-delay:calc(var(--i) * 140ms + 300ms)` |
| - | `.ez-qr button` | `animation:ez-up .45s cubic-bezier(.2,.8,.2,1) both`<br>`animation-delay:calc(var(--i) * 70ms)`<br>`transition:transform .2s` |
| - | `.ez-qr button:hover` | `transform:translateY(-2px)` |
| - | `.ez-mic` | `transition:background .25s` |
| - | `.ez-mic.on::after` | `animation:ez-ping 1.2s ease-out infinite` |
| - | `.ez-wave i` | `animation:ez-wv .9s ease-in-out infinite` |
| - | `.ez-wave i:nth-child(2)` | `animation-delay:.15s` |
| - | `.ez-wave i:nth-child(3)` | `animation-delay:.3s` |
| - | `.ez-wave i:nth-child(4)` | `animation-delay:.45s` |
| - | `@keyframes ez-wv` | `frames: 0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}` |
| - | `.ez-fq svg` | `transition:transform .35s cubic-bezier(.2,.8,.2,1)` |
| - | `.ez-fq.open svg` | `transform:rotate(180deg)` |
| - | `.ez-fa` | `transition:grid-template-rows .4s cubic-bezier(.2,.8,.2,1)` |
| - | `.ez-ba` | `animation:ez-up .5s cubic-bezier(.2,.8,.2,1) both`<br>`animation-delay:calc(var(--i) * 140ms)` |
| - | `.ez-arr` | `animation:ez-nudge 1.8s ease-in-out infinite` |
| - | `[dir="ltr"] .ez-arr` | `scale:-1 1`<br>`animation-name:ez-nudge2` |
| - | `@keyframes ez-nudge` | `frames: 50%{translate:-5px 0}` |
| - | `@keyframes ez-nudge2` | `frames: 50%{translate:5px 0}` |
| - | `.ez-thanks` | `animation:ez-pop .5s cubic-bezier(.2,1.4,.4,1) both` |
| reduced | `.ez-resume,.ez-back,.ez-assure span,.ez-qr button,.ez-qp i.c,.ez-mic.on::after,.ez-wave i,.ez-ba,.ez-arr,.ez-thanks` | `animation:none!important` |
| reduced | `.ez-fa,.ez-fq svg,.ez-qp i` | `transition:none` |
| - | `.ez-avr` | `animation:ez-spin 6s linear infinite` |
| - | `.ez-fcta` | `transition:transform .25s,box-shadow .25s` |
| - | `.ez-fcta:hover` | `transform:translateY(-2px)` |
| - | `.ez-farr` | `transition:translate .25s` |
| - | `[dir="ltr"] .ez-farr` | `scale:-1 1` |
| - | `.ez-fcta:hover .ez-farr` | `translate:-4px 0` |
| - | `[dir="ltr"] .ez-fcta:hover .ez-farr` | `translate:4px 0` |
| - | `.ez-fcols a` | `transition:color .2s` |
| - | `.ez-fmark` | `transform:translateY(18%)` |
| - | `.ez-toc a` | `transition:background .25s,color .25s` |
| - | `.ez-abchips span` | `animation:ez-up .6s cubic-bezier(.2,.8,.2,1) both`<br>`animation-delay:calc(1s + var(--i) * 120ms)` |
| - | `.ez-yi` | `transition:stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)`<br>`transition-delay:calc(var(--i) * .12s + .3s)` |
| - | `.ez-num li` | `animation:none` |
| - | `.ez-num li::after` | `animation:none` |
| - | `.ez-fring` | `animation:ez-spin 10s linear infinite` |
| - | `.ez-ftag` | `animation:ez-bob 6s ease-in-out infinite` |
| - | `.ez-ftag.g1` | `animation-delay:-2s` |
| - | `.ez-ftag.g2` | `animation-delay:-4s` |
| reduced | `.ez-avr,.ez-fring,.ez-ftag,.ez-abchips span` | `animation:none!important` |
| reduced | `.ez-yi` | `transition:none` |
| reduced | `.rv:not(.in) .ez-yi` | `stroke-dashoffset:0` |
| - | `.lg-d1,.lg-d2,.lg-d3` | `transition:translate .4s ease-out` |
| - | `.lg-rich .lg-d1` | `translate:calc(var(--mx,0) * -5px) calc(var(--my,0) * -4px)` |
| - | `.lg-rich .lg-d2` | `translate:calc(var(--mx,0) * 8px) calc(var(--my,0) * 6px)` |
| - | `.lg-rich .lg-d3` | `translate:calc(var(--mx,0) * 14px) calc(var(--my,0) * 10px)` |
| - | `.lg-rich.lg-a .lg-l` | `animation:lg-l .9s .15s cubic-bezier(.2,.8,.2,1) both,lg-float 5s ease-in-out 1.05s infinite,lg-bl 3.2s ease-in-out 1.4s infinite` |
| - | `.lg-rich.lg-a .lg-r` | `animation:lg-r .9s .15s cubic-bezier(.2,.8,.2,1) both,lg-float 5s ease-in-out 1.05s infinite,lg-br 3.2s ease-in-out 1.4s infinite` |
| - | `.lg-rich.lg-a .lg-s` | `animation:lg-pop .9s .5s cubic-bezier(.2,1.4,.4,1) both,lg-pulse 3.2s ease-in-out 1.4s infinite,lg-tw 3.2s ease-in-out 1.4s infinite` |
| - | `.lg-rich.lg-hot .lg-s` | `animation:lg-flash .8s ease-out` |
| - | `@keyframes lg-bl` | `frames: 50%{translate:-7px 0}` |
| - | `@keyframes lg-br` | `frames: 50%{translate:7px 0}` |
| - | `@keyframes lg-tw` | `frames: 50%{rotate:14deg}` |
| - | `@keyframes lg-flash` | `frames: 0%{transform:scale(1)}30%{transform:scale(1.9) rotate(45deg)}100%{transform:scale(1)}` |
| - | `.lg-burst` | `transform-box:fill-box`<br>`transform-origin:center`<br>`animation:lg-ring .9s ease-out both` |
| - | `@keyframes lg-ring` | `frames: from{transform:scale(.6);opacity:.9}to{transform:scale(4);opacity:0}` |
| reduced | `.lg-orb,.lg-shine,.lg-p,.lg-burst` | `animation:none!important` |
| reduced | `.lg-p` | `display:none` |
| reduced | `.lg-d1,.lg-d2,.lg-d3` | `transition:none` |
| - | `.lg-p` | `transform-box:fill-box`<br>`transform-origin:center`<br>`animation:lg-rise 4.2s ease-out infinite`<br>`animation-delay:calc(var(--i) * .8s + 2s)` |
| - | `@keyframes lg-rise` | `frames: 0%{transform:translateY(0) scale(.7);opacity:0}20%{opacity:.5}100%{transform:translateY(-46px) scale(1);opacity:0}` |
| reduced | `.lg-p` | `animation:none!important`<br>`display:none` |

228 rows, 39 keyframes

Notes: "reduced" in the context column stands for `@media(prefers-reduced-motion:reduce)`; "no-preference" for `@media(prefers-reduced-motion:no-preference)`. The generated file writes the full media query. Rows with context `-` are top level.
