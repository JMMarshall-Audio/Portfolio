/* ============================================================
   work.js — the single source of truth for what is PUBLIC in the
   homepage Work section, and what is still an unpublished draft.
   ============================================================

   HOW PUBLICATION WORKS (each project is independent):

   1. Draft pages live in drafts/*.html. They render only on a local
      host (localhost / 127.0.0.1 / file://) and never on a deployed
      site — and the pages themselves self-blank off-host as a second
      guard.

   2. To PUBLISH a project (one step, this file only — no other
      website file changes):
         python3 tools/publish-project.py <id>
      That copies drafts/<id>.html → work-<id>.html (the root copy
      that deploys), then flips this entry's published flag to true.
      The homepage renders it automatically: the project's card
      appears in each of its categories, and a category that now has
      at least one published project loses its Work-in-Progress state.

   3. To WITHDRAW a project:
         python3 tools/publish-project.py <id> --unpublish
      Its card disappears from the public grid and any category it was
      the only published project in returns to Work-in-Progress.

   Editing, saving or previewing a draft NEVER publishes anything.
   Only this flag does.

   PROJECT ENTRIES — categories use the homepage filter slugs:
   studio | post | foley | music-editing | game-sound | composition | field
   (a project may list more than one category; listings stay in sync)
   ============================================================ */

(function () {
    "use strict";

    /* Affection — peak envelope of the FULL mix (700 buckets, 0-100),
       computed from the complete track: originals/Affection Mix.wav
       (stereo 48k/24-bit, 2:56). Regenerate with an ffmpeg|python peak
       extract over every frame of the file, not a clip. */
    var WAVEFORMS = {
        affection: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 6, 8, 11, 15, 17, 20, 19, 22, 23, 23, 29, 26, 100, 41, 41, 36, 74, 34, 30, 29, 90, 30, 87, 25, 73, 35, 22, 80, 25, 19, 17, 61, 26, 23, 24, 84, 20, 84, 52, 52, 20, 13, 88, 12, 10, 7, 62, 17, 10, 12, 86, 14, 86, 65, 35, 17, 27, 99, 34, 25, 23, 65, 25, 23, 28, 88, 88, 94, 61, 33, 42, 21, 85, 14, 39, 34, 61, 34, 27, 35, 93, 87, 35, 70, 25, 15, 12, 86, 13, 42, 34, 69, 27, 22, 83, 87, 83, 20, 62, 19, 10, 12, 91, 10, 30, 31, 63, 32, 23, 89, 33, 88, 22, 68, 19, 14, 20, 81, 21, 14, 8, 70, 17, 17, 81, 22, 89, 15, 66, 59, 22, 12, 80, 32, 27, 39, 62, 31, 40, 85, 31, 28, 24, 51, 36, 27, 10, 82, 22, 17, 54, 48, 41, 37, 78, 19, 16, 14, 54, 12, 10, 15, 77, 31, 25, 51, 38, 34, 23, 78, 25, 19, 18, 51, 15, 11, 13, 85, 23, 17, 55, 35, 29, 30, 84, 20, 78, 12, 50, 32, 11, 75, 73, 21, 16, 60, 46, 43, 36, 85, 37, 28, 37, 63, 31, 23, 88, 38, 27, 22, 53, 37, 42, 28, 83, 30, 27, 13, 50, 17, 20, 82, 21, 20, 20, 62, 37, 38, 31, 84, 31, 28, 25, 60, 18, 7, 77, 27, 40, 34, 57, 33, 28, 29, 76, 31, 73, 52, 53, 50, 15, 84, 26, 45, 37, 58, 42, 29, 35, 78, 41, 72, 57, 38, 14, 8, 80, 22, 37, 35, 71, 39, 30, 27, 85, 86, 60, 68, 25, 15, 12, 82, 10, 43, 33, 63, 27, 26, 66, 89, 80, 19, 60, 17, 13, 8, 82, 18, 43, 35, 65, 32, 23, 85, 51, 73, 25, 66, 16, 9, 11, 94, 17, 11, 13, 66, 20, 15, 88, 27, 77, 22, 56, 33, 18, 17, 77, 31, 21, 17, 64, 36, 39, 95, 26, 9, 10, 57, 18, 14, 7, 77, 12, 12, 72, 55, 48, 33, 78, 18, 16, 12, 53, 10, 8, 8, 76, 19, 23, 62, 39, 36, 28, 80, 22, 14, 14, 53, 21, 7, 9, 75, 41, 35, 49, 33, 28, 33, 85, 37, 74, 9, 44, 9, 14, 31, 71, 51, 47, 64, 49, 26, 41, 75, 55, 33, 17, 56, 13, 12, 72, 58, 11, 16, 67, 42, 41, 41, 85, 10, 10, 6, 48, 12, 12, 73, 18, 14, 14, 57, 39, 45, 25, 86, 19, 13, 14, 48, 26, 12, 83, 17, 11, 16, 57, 36, 36, 51, 76, 12, 88, 86, 86, 76, 65, 84, 20, 17, 32, 56, 29, 23, 22, 76, 14, 82, 64, 38, 45, 25, 77, 25, 24, 41, 72, 34, 24, 25, 85, 73, 79, 49, 34, 51, 36, 89, 55, 43, 26, 54, 28, 24, 25, 83, 77, 42, 50, 47, 41, 36, 79, 48, 81, 38, 83, 29, 23, 71, 72, 54, 44, 58, 51, 57, 31, 82, 43, 38, 37, 66, 32, 35, 79, 45, 77, 18, 62, 21, 26, 25, 74, 18, 21, 36, 81, 57, 47, 90, 53, 80, 34, 67, 30, 31, 29, 75, 28, 31, 61, 66, 40, 37, 75, 37, 77, 29, 62, 35, 36, 37, 83, 55, 39, 80, 50, 40, 67, 62, 82, 60, 72, 53, 67, 42, 67, 92, 51, 45, 75, 47, 45, 52, 74, 27, 77, 34, 65, 31, 28, 39, 77, 40, 59, 74, 51, 63, 60, 94, 44, 76, 29, 63, 30, 30, 73, 82, 48, 52, 75, 48, 53, 44, 83, 30, 73, 25, 62, 35, 29, 21, 76, 25, 76, 22, 74, 33, 81, 27, 82, 38, 50, 38, 30, 24, 23, 21, 23, 17, 16, 17, 15, 19, 16, 19, 14, 19, 15, 14, 15, 17, 9, 12, 14, 11, 11, 12, 12, 10, 9, 12, 13, 9, 11, 7, 5, 6, 6, 4, 3, 16, 15, 23, 17, 14, 13, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
    };

    var PROJECTS = [
        // ---------------------------------------------------------------
        // PUBLISHED (public)
        // ---------------------------------------------------------------
        {
            id: "affection",
            title: "AFFECTION",
            tape: "TAPE №008",
            categories: ["studio"],
            badge: "Music Mix",
            teaser: "Unmastered stereo music mix, shown as mixed: re-amped bass, sidechained guitar solo and bespoke plate reverbs.",
            media: "audio",
            published: true
        },
        // ---------------------------------------------------------------
        // DRAFTS (local preview only; NOT public until approved)
        // Publish: python3 tools/publish-project.py <id>
        // ---------------------------------------------------------------
        {
            id: "cathedral-bells",
            title: "CATHEDRAL BELLS",
            tape: "TAPE №009",
            categories: ["field"],
            badge: "Field Recording · Sound Library",
            teaser: "A sound library of Chichester Cathedral bells — recorded, edited and compiled.",
            media: "audio",
            published: false
        },
        {
            id: "mini",
            title: "MINI",
            tape: "TAPE №010",
            categories: ["post"],
            badge: "Post Production · Drama Episode",
            teaser: "Full post-production on a short drama episode — dialogue through mix to EBU R128 delivery.",
            media: "video",
            published: false
        },
        {
            id: "avatar",
            title: "AVATAR",
            tape: "TAPE №011",
            categories: ["studio"],
            badge: "Sound Redesign",
            teaser: "A complete sound redesign from scratch — recorded dialogue and Foley, sourced effects and music, mixed.",
            media: "video",
            published: false
        },
        {
            id: "toy-story",
            title: "TOY STORY",
            tape: "TAPE №012",
            categories: ["composition"],
            badge: "Composition · Score to Picture",
            teaser: "An original composition written to picture, with deliberate synchronisation points, tempo and metre decisions.",
            media: "video",
            published: false
        },
        {
            id: "ksp",
            title: "KSP",
            tape: "TAPE №013",
            categories: ["studio", "composition"],
            badge: "Game Audio · Wwise + Score",
            teaser: "A redesigned set of KSP sound effects implemented in Wwise, plus multiple original compositions.",
            media: "video",
            published: false
        }
        // To add a future project: create drafts/<id>.html following the
        // existing draft pattern (draft-ribbon, draft-lock, placeholders),
        // add an entry with published:false, and publish when approved.
    ];

    var CATEGORIES = [
        { slug: "studio",       name: "Studio & Sound Design" },
        { slug: "post",         name: "Post Production" },
        { slug: "foley",        name: "Foley & ADR" },
        { slug: "music-editing", name: "Music Editing" },
        { slug: "game-sound",    name: "Game Sound" },
        { slug: "composition",  name: "Composition & Scoring" },
        { slug: "field",        name: "Field Recording" }
    ];

    /* Per-category Work-in-Progress illustration concepts (all CSS/SVG,
       lightweight, diegetic to the site's console/tape identity, each one
       different). prefers-reduced-motion switches them off. */
    var WIP_ANIM = {
        studio:   "wip-fader",       // a fader cap that creeps up to unity
        post:     "wip-console",    // a mixing console — faders riding, meters dancing
        foley:    "wip-foley-adr", // two columns: the boom + shoes, the ADR booth
        "music-editing": "wip-edit",  // a playhead sweeping across a waveform clip
        "game-sound":    "wip-pad",    // a gamepad blinking, sound arcs pulsing out
        composition: "wip-notes",    // notes drifting up a stave
        field:    "wip-waves"        // a mic on a stand emitting recording waves
    };

    /* ---------------- WIP panel markup ---------------- */
    function wipPanel(cat) {
        var anim = WIP_ANIM[cat.slug] || "wip-waves";
        return (
            '<article class="sprocket-card overflow-hidden showcase-card wip-panel" data-category="' + cat.slug + '" aria-label="' + cat.name + ' — work in progress">' +
                '<div class="sprocket-strip"></div>' +
                '<div class="wip-stage" aria-hidden="true">' + wipArt(anim) + '<div class="wip-fade"></div></div>' +
                '<div class="p-6">' +
                    '<div class="font-mono text-xs text-tape-cream-dim mb-1">' + cat.name + '</div>' +
                    '<span class="inline-block px-2 py-0.5 bg-vu-amber/10 text-vu-amber text-xs font-mono mb-3">WORK IN PROGRESS</span>' +
                    '<h3 class="text-lg font-semibold mb-2">' + cat.name + '</h3>' +
                    '<p class="text-tape-cream-dim text-sm leading-relaxed mb-4">I have completed work in this area and am still in the process of bringing it into my portfolio. If you would like to see any of my work in this area, don\'t hesitate to get in touch by email or via the contact form below.</p>' +
                    '<div class="flex flex-wrap gap-3">' +
                        '<a href="#contact" class="inline-block px-4 py-2 btn-amber font-mono text-xs uppercase tracking-widest">Contact me</a>' +
                        '<a href="mailto:JMMarshall.Audio@proton.me" class="inline-block px-4 py-2 btn-outline font-mono text-xs uppercase tracking-widest">Email</a>' +
                    '</div>' +
                '</div>' +
                '<div class="sprocket-strip"></div>' +
            '</article>'
        );
    }

    /* ---------------- Waveform graphic (audio cards) ---------------- */
    function waveformCard(peaks) {
        var n = peaks.length, w = 4, gap = 1;
        var W = n * (w + gap), H = 72, mid = H / 2;
        var rects = "";
        for (var i = 0; i < n; i++) {
            var h = Math.max(2, Math.round(peaks[i] / 100 * H * 0.92));
            var y = Math.round(mid - h / 2);
            rects += '<rect x="' + (i * (w + gap)) + '" y="' + y +
                     '" width="' + w + '" height="' + h + '" fill="#e8a33d" opacity="0.85"/>';
        }
        return '<svg class="w-full px-8" viewBox="0 0 ' + W + ' ' + H +
               '" preserveAspectRatio="none" style="height:76px" shape-rendering="crispEdges" role="img" aria-label="Waveform of the full Affection mix">' + rects + '</svg>';
    }

    /* ---------------- Card markup ---------------- */
    function projectCard(p, cat) {
        // index.html sits at the site root and the project pages live in
        // work/ — both parts of the href are relative to the root.
        var href = p.published ? ("work/work-" + p.id + ".html") : ("drafts/" + p.id + ".html");
        var isDraft = !p.published;
        var tall = p.media === "audio";
        return (
            '<article class="sprocket-card overflow-hidden card-hover showcase-card" data-category="' + cat.slug + '">' +
                '<div class="sprocket-strip"></div>' +
                '<div class="' + (tall ? "w-full py-10" : "aspect-video w-full") + ' bg-stage-black border-y border-reel-border flex flex-col items-center justify-center gap-2 text-tape-cream-dim">' +
                    (p.media === "audio" && WAVEFORMS[p.id] ? waveformCard(WAVEFORMS[p.id]) :
                        '<i class="fas ' + (p.media === "video" ? "fa-clapperboard" : "fa-compact-disc") + ' text-3xl"></i>') +
                    '<a class="font-mono text-xs uppercase tracking-widest text-tape-cream-dim hover:text-vu-amber hover:underline" href="' + href + '" ' + (isDraft ? 'title="Draft preview — local only"' : '') + '>' + (p.media === "video" ? "Watch" : "Listen") + '</a>' +
                '</div>' +
                '<div class="sprocket-strip"></div>' +
                '<div class="p-6">' +
                    '<div class="font-mono text-xs text-tape-cream-dim mb-1">' + (p.tape || "") + '</div>' +
                    '<span class="inline-block px-2 py-0.5 bg-vu-amber/10 text-vu-amber text-xs font-mono mb-2">' + (p.badge || cat.name) + '</span>' +
                    (isDraft ? '<span class="inline-block px-2 py-0.5 ml-1 text-xs font-mono border border-vu-amber/50 text-vu-amber" style="color:#e8a33d!important">DRAFT</span>' : '') +
                    '<h3 class="text-lg font-semibold mb-2">' + p.title + '</h3>' +
                    '<p class="text-tape-cream-dim text-sm mb-4">' + p.teaser + '</p>' +
                    '<a class="font-mono text-xs uppercase tracking-widest text-vu-amber hover:underline" href="' + href + '" ' +
                        (isDraft ? 'title="Draft preview — local only"' : '') + '>' +
                        (isDraft ? "Preview draft (local) →" : "View project →") + '</a>' +
                '</div>' +
            '</article>'
        );
    }

    /* ---------------- Render into the homepage grid ---------------- */
    function render() {
        var grid = document.getElementById("showcaseGrid");
        if (!grid) return;
        var html = "";
        CATEGORIES.forEach(function (cat) {
            var pub = PROJECTS.filter(function (p) { return p.published && p.categories.indexOf(cat.slug) !== -1; });
            // A project may own two cards (one per category) — same page, two listings.
            pub.forEach(function (p) { html += projectCard(p, cat); });
            // No published work in this category? Show the WORK IN PROGRESS
            // panel — in every environment, not just the deployed site.
            // Drafts stay openable directly via drafts/<id>.html but never
            // surface on the homepage grid.
            if (!pub.length) html += wipPanel(cat);
        });
        grid.innerHTML = html;
    }

    /* ---------------- WIP artwork (pure CSS/SVG, per category) ---------------- */
    function wipArt(kind) {
        return {
            "wip-fader":
                '<svg viewBox="0 0 400 140" class="wip-svg" role="img" aria-label="Fader illustration">' +
                '<line x1="60" y1="24" x2="60" y2="116" stroke="#2b2925" stroke-width="4"/><line x1="340" y1="24" x2="340" y2="116" stroke="#2b2925" stroke-width="4"/>' +
                '<g class="wip-fader-cap"><rect x="48" y="30" width="24" height="26" rx="4" fill="#e8a33d"/></g>' +
                '<text x="212" y="96" text-anchor="middle" class="wip-mono-text">∞ … 0</text>' +
                '<text x="200" y="134" text-anchor="middle" class="wip-mono-text">STUDIO</text></svg>',

            "wip-console":
                '<svg viewBox="0 0 400 140" class="wip-svg" role="img" aria-label="Mixing console faders and level meters illustration">' +
                '<g stroke="#2b2925" stroke-width="3" stroke-linecap="round">' +
                '<line x1="96" y1="34" x2="96" y2="104"/><line x1="136" y1="34" x2="136" y2="104"/><line x1="176" y1="34" x2="176" y2="104"/><line x1="216" y1="34" x2="216" y2="104"/><line x1="256" y1="34" x2="256" y2="104"/>' +
                '</g>' +
                '<rect class="wip-console-a" x="85" y="62" width="22" height="12" rx="3" fill="#e8a33d"/>' +
                '<rect class="wip-console-b" x="125" y="78" width="22" height="12" rx="3" fill="#e8a33d"/>' +
                '<rect class="wip-console-c" x="165" y="54" width="22" height="12" rx="3" fill="#e8a33d"/>' +
                '<rect class="wip-console-d" x="205" y="72" width="22" height="12" rx="3" fill="#e8a33d"/>' +
                '<rect class="wip-console-e" x="245" y="58" width="22" height="12" rx="3" fill="#e8a33d"/>' +
                '<g class="wip-meters" fill="#5fae9e">' +
                '<rect x="292" y="44" width="9" height="56"/><rect x="308" y="52" width="9" height="48"/><rect x="324" y="40" width="9" height="60" fill="#e8a33d"/>' +
                '</g>' +
                '<rect x="74" y="102" width="284" height="14" rx="4" fill="#161513" stroke="#2b2925"/>' +
                // ceiling: the tallest meter peaks against the EBU R128
                // -1 dBTP true-peak ceiling (dashed)
                '<line x1="286" y1="40" x2="336" y2="40" stroke="#c1272d" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.85"/>' +
                '<text x="358" y="36" text-anchor="end" class="wip-mono-text">-1 dBTP</text>' +
                '<text x="216" y="134" text-anchor="middle" class="wip-mono-text">POST PRODUCTION</text></svg>',

            "wip-foley-adr":
                // One card, two columns — Foley (boom + shoes) and ADR (script booth).
                '<div class="wip-cols">' +
                '<div class="wip-col">' +
                '<svg viewBox="0 0 200 140" class="wip-svg" role="img" aria-label="Boom microphone pointing down at a pair of walking shoes">' +
                '<line x1="4" y1="120" x2="196" y2="120" stroke="#8a6a34" stroke-width="2" stroke-dasharray="2 8" opacity="0.6"/>' +
                '<line x1="16" y1="24" x2="156" y2="24" stroke="#2b2925" stroke-width="3" stroke-linecap="round"/>' +
                '<rect x="6" y="17" width="12" height="14" rx="2.5" fill="#2b2925"/>' +
                '<line x1="156" y1="24" x2="156" y2="42" stroke="#2b2925" stroke-width="2.5"/>' +
                '<line x1="150" y1="30" x2="162" y2="30" stroke="#8a6a34" stroke-width="1.2"/>' +
                '<path d="M147 42 h18 v22 q0 9 -9 9 q-9 0 -9 -9 z" fill="#161513" stroke="#e8a33d" stroke-width="2.5"/>' +
                '<line x1="150" y1="60" x2="162" y2="60" stroke="#e8a33d" stroke-width="1.2" opacity="0.7"/>' +
                '<line x1="150" y1="65" x2="162" y2="65" stroke="#e8a33d" stroke-width="1.2" opacity="0.45"/>' +
                '<g class="wip-steps">' +
                '<g transform="translate(44,100)"><g class="wip-shoe-back">' +
                '<path d="M2 14 L2 7 Q2 1 9 1 Q13 1 15 5 Q20 11 30 12.5 Q42 13.5 52 14 Z" fill="#a8a294"/>' +
                '<path d="M2 14 L52 14 Q55 14 55 17 Q55 20 52 20 L2 20 Q-1 20 -1 17 Q-1 14 2 14 Z" fill="#6b5326"/>' +
                '</g></g>' +
                '<g transform="translate(88,100)"><g class="wip-shoe-front">' +
                '<path d="M2 14 L2 7 Q2 1 9 1 Q13 1 15 5 Q20 11 30 12.5 Q42 13.5 52 14 Z" fill="#ede6d6"/>' +
                '<path d="M2 14 L52 14 Q55 14 55 17 Q55 20 52 20 L2 20 Q-1 20 -1 17 Q-1 14 2 14 Z" fill="#8a6a34"/>' +
                '</g></g>' +
                '</g>' +
                '<text x="14" y="132" class="wip-mono-text">FOLEY</text></svg>' +
                '</div>' +
                '<div class="wip-col">' +
                '<svg viewBox="0 0 200 140" class="wip-svg" role="img" aria-label="Actor in headphones reading a script, talking into a studio microphone">' +
                // script page
                '<rect x="8" y="28" width="46" height="96" rx="4" fill="#161513" stroke="#2b2925"/>' +
                '<g fill="#2b2925">' +
                '<rect x="15" y="52" width="32" height="3.5" rx="1.75"/>' +
                '<rect x="15" y="64" width="26" height="3.5" rx="1.75"/>' +
                '<rect x="15" y="76" width="32" height="3.5" rx="1.75"/>' +
                '<rect x="15" y="88" width="22" height="3.5" rx="1.75"/>' +
                '</g>' +
                '<g class="wip-adr-read"><rect x="12" y="47" width="42" height="13" rx="2.5" fill="none" stroke="#e8a33d" stroke-width="1.5"/></g>' +
                // voice waves travelling from the mouth toward the mic
                '<g fill="none" stroke="#e8a33d" stroke-width="2" stroke-linecap="round">' +
                '<path class="wip-adr-wave-a" d="M100 56 q 9 7 0 16"/>' +
                '<path class="wip-adr-wave-b" d="M106 52 q 11 10 0 24"/>' +
                '<path class="wip-adr-wave-c" d="M112 47 q 13 13 0 32"/>' +
                '</g>' +
                // pop filter between mouth and mic
                '<circle cx="132" cy="64" r="6.5" fill="none" stroke="#8a6a34" stroke-width="1.5"/>' +
                '<circle cx="132" cy="64" r="4" fill="none" stroke="#8a6a34" stroke-width="0.8"/>' +
                // mic on a stand, grille end facing the talent
                '<line x1="176" y1="126" x2="176" y2="68" stroke="#2b2925" stroke-width="3" stroke-linecap="round"/>' +
                '<line x1="176" y1="70" x2="165" y2="55" stroke="#2b2925" stroke-width="3" stroke-linecap="round"/>' +
                '<g transform="rotate(-25 152 52)"><rect x="140" y="45" width="26" height="14" rx="7" fill="#161513" stroke="#2b2925" stroke-width="1.5"/>' +
                '<g stroke="#8a6a34" stroke-width="1.3"><line x1="145" y1="47" x2="145" y2="57"/><line x1="149" y1="47" x2="149" y2="57"/><line x1="153" y1="47" x2="153" y2="57"/></g></g>' +
                // talent in headphones: band PLUS both ear cups, nodding while reading
                '<g class="wip-adr-nod">' +
                '<circle cx="80" cy="64" r="15" fill="#161513" stroke="#2b2925" stroke-width="2"/>' +
                '<path d="M65 60 a 15 15 0 0 1 30 0" fill="none" stroke="#8a6a34" stroke-width="2.5"/>' +
                '<rect x="61" y="57" width="6" height="12" rx="2.5" fill="#e8a33d"/>' +
                '<rect x="93" y="57" width="6" height="12" rx="2.5" fill="#e8a33d"/>' +
                '</g>' +
                '<text x="186" y="132" text-anchor="end" class="wip-mono-text">ADR</text></svg>' +
                '</div>' +
                '</div>',

            "wip-edit":
                '<svg viewBox="0 0 400 140" class="wip-svg" role="img" aria-label="Music editing timeline illustration">' +
                '<g stroke="#2b2925" stroke-width="1.5"><line x1="48" y1="26" x2="48" y2="114"/><line x1="352" y1="26" x2="352" y2="114"/></g>' +
                '<g>' +
                '<rect x="64" y="52" width="7" height="36" fill="#5fae9e"/><rect x="76" y="44" width="7" height="52" fill="#5fae9e"/><rect x="88" y="56" width="7" height="28" fill="#5fae9e"/><rect x="100" y="40" width="7" height="60" fill="#5fae9e"/><rect x="112" y="48" width="7" height="44" fill="#5fae9e"/><rect x="124" y="58" width="7" height="24" fill="#5fae9e"/><rect x="136" y="42" width="7" height="56" fill="#5fae9e"/><rect x="148" y="51" width="7" height="38" fill="#e8a33d"/>' +
                '<rect x="160" y="38" width="7" height="64" fill="#e8a33d"/><rect x="172" y="55" width="7" height="30" fill="#e8a33d"/><rect x="184" y="47" width="7" height="46" fill="#e8a33d"/><rect x="196" y="57" width="7" height="26" fill="#e8a33d"/><rect x="208" y="41" width="7" height="58" fill="#e8a33d"/><rect x="220" y="50" width="7" height="40" fill="#e8a33d"/><rect x="232" y="59" width="7" height="22" fill="#e8a33d"/><rect x="244" y="40" width="7" height="60" fill="#5fae9e"/>' +
                '<rect x="256" y="52" width="7" height="36" fill="#5fae9e"/><rect x="268" y="44" width="7" height="52" fill="#5fae9e"/><rect x="280" y="56" width="7" height="28" fill="#5fae9e"/><rect x="292" y="41" width="7" height="58" fill="#5fae9e"/><rect x="304" y="47" width="7" height="46" fill="#5fae9e"/><rect x="316" y="53" width="7" height="34" fill="#5fae9e"/><rect x="328" y="58" width="7" height="24" fill="#5fae9e"/><rect x="340" y="49" width="7" height="42" fill="#5fae9e"/>' +
                '</g>' +
                '<g class="wip-playhead"><line x1="72" y1="20" x2="72" y2="120" stroke="#e8a33d" stroke-width="2"/><path d="M66 20 h12 l-6 8 z" fill="#e8a33d"/></g>' +
                '<text x="350" y="132" text-anchor="end" class="wip-mono-text">MUSIC EDITING …</text></svg>',

            "wip-pad":
                '<svg viewBox="0 0 400 140" class="wip-svg" role="img" aria-label="Gamepad triggering an expanding sound shockwave">' +
                // the sound event: burst rays + expanding shock rings
                '<g stroke="#e8a33d" stroke-width="2.5" stroke-linecap="round">' +
                '<line x1="262" y1="46" x2="256" y2="36"/>' +
                '<line x1="286" y1="46" x2="292" y2="36"/>' +
                '<line x1="254" y1="70" x2="242" y2="76"/>' +
                '<line x1="296" y1="70" x2="308" y2="76"/>' +
                '</g>' +
                '<circle class="wip-blink" cx="274" cy="62" r="6" fill="#e8a33d"/>' +
                '<g fill="none" stroke="#e8a33d" stroke-width="2.5" stroke-linecap="round">' +
                '<circle class="wip-ring-a" cx="274" cy="62" r="34"/>' +
                '<circle class="wip-ring-b" cx="274" cy="62" r="34"/>' +
                '<circle class="wip-ring-c" cx="274" cy="62" r="34"/>' +
                '</g>' +
                // dotted trigger wire from the pad button to the sound event
                '<path d="M152 98 L 252 70" stroke="#2b2925" stroke-width="2" stroke-dasharray="3 6" fill="none"/>' +
                // gamepad, bottom-left
                '<rect x="34" y="84" width="118" height="40" rx="20" fill="#161513" stroke="#2b2925"/>' +
                '<g fill="#2b2925"><rect x="50" y="100" width="22" height="7" rx="2"/><rect x="57.5" y="92.5" width="7" height="22" rx="2"/></g>' +
                '<circle cx="120" cy="98" r="5" fill="#5fae9e"/>' +
                '<circle class="wip-blink" cx="133" cy="108" r="5" fill="#e8a33d"/>' +
                '<circle cx="120" cy="118" r="5" fill="#e8a33d" opacity=".8"/>' +
                '<text x="200" y="132" text-anchor="middle" class="wip-mono-text">GAME SOUND</text></svg>',

            "wip-notes":
                '<svg viewBox="0 0 400 140" class="wip-svg" role="img" aria-label="Musical notes on a stave illustration">' +
                '<g stroke="#2b2925" stroke-width="1.5">' +
                '<line x1="40" y1="58" x2="360" y2="58"/><line x1="40" y1="70" x2="360" y2="70"/><line x1="40" y1="82" x2="360" y2="82"/><line x1="40" y1="94" x2="360" y2="94"/><line x1="40" y1="106" x2="360" y2="106"/></g>' +
                '<g class="wip-note-a" fill="#e8a33d"><ellipse cx="120" cy="86" rx="7" ry="5" transform="rotate(-18 120 86)"/><rect x="126" y="58" width="2.5" height="27"/></g>' +
                '<g class="wip-note-b" fill="#5fae9e"><ellipse cx="200" cy="74" rx="7" ry="5" transform="rotate(-18 200 74)"/><rect x="206" y="46" width="2.5" height="27"/></g>' +
                '<g class="wip-note-c" fill="#e8a33d" opacity="0.7"><ellipse cx="280" cy="92" rx="7" ry="5" transform="rotate(-18 280 92)"/><rect x="286" y="64" width="2.5" height="27"/></g>' +
                '<text x="200" y="134" text-anchor="middle" class="wip-mono-text">COMPOSITION</text></svg>',

            "wip-waves":
                '<svg viewBox="0 0 400 140" class="wip-svg" role="img" aria-label="Studio microphone recording illustration">' +
                '<g fill="none" stroke="#e8a33d" stroke-width="2.5" stroke-linecap="round">' +
                '<path class="wip-wave-a" d="M168 48 a 14 14 0 0 0 0 26"/>' +
                '<path class="wip-wave-b" d="M156 40 a 24 24 0 0 0 0 42"/>' +
                '<path class="wip-wave-c" d="M144 32 a 34 34 0 0 0 0 58"/>' +
                '</g>' +
                '<rect x="186" y="36" width="28" height="44" rx="13" fill="#161513" stroke="#2b2925"/>' +
                '<g stroke="#8a6a34" stroke-width="2"><line x1="192" y1="48" x2="208" y2="48"/><line x1="192" y1="56" x2="208" y2="56"/><line x1="192" y1="64" x2="208" y2="64"/></g>' +
                '<g stroke="#2b2925" stroke-width="3" fill="none" stroke-linecap="round">' +
                '<line x1="200" y1="80" x2="200" y2="116"/><line x1="200" y1="116" x2="184" y2="126"/><line x1="200" y1="116" x2="216" y2="126"/></g>' +
                '<circle class="wip-blink" cx="248" cy="114" r="4" fill="#c1272d"/>' +
                '<text x="262" y="118" class="wip-mono-text">REC</text>' +
                '<text x="36" y="134" class="wip-mono-text">FIELD REC</text></svg>'
        }[kind] || "";
    }

    /* ---------------- Styles for WIP + draft cards ---------------- */
    var style = document.createElement("style");
    style.textContent =
        ".wip-stage{position:relative;height:180px;background:#0f0e0c;border-bottom:1px solid #2b2925;overflow:hidden}" +
        ".wip-svg{position:absolute;inset:0;width:100%;height:100%}" +
        ".wip-fade{position:absolute;left:0;right:0;bottom:0;height:64px;background:linear-gradient(to bottom,rgba(15,14,12,0),#161513)}" +
        "/* two-column stage (Foley | ADR) */" +
        ".wip-cols{position:absolute;inset:0;display:flex}" +
        ".wip-col{position:relative;flex:1 1 0;min-width:0}" +
        ".wip-col + .wip-col{border-left:1px solid #2b2925}" +
        ".wip-mono-text{fill:#8a6a34;font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.25em}" +
        /* studio fader */
        ".wip-fader-cap{animation:wipFader 4.5s ease-in-out infinite}" +
        "@keyframes wipFader{0%,100%{transform:translateY(56px)}50%{transform:translateY(-18px)}}" +
        /* post engineer meters */
        ".wip-meters rect{transform-box:fill-box;transform-origin:center bottom}" +
        ".wip-meters rect:nth-child(1){animation:wipMeter 1.1s ease-in-out infinite}" +
        ".wip-meters rect:nth-child(2){animation:wipMeter 0.9s ease-in-out .2s infinite}" +
        ".wip-meters rect:nth-child(3){animation:wipMeter 1.3s ease-in-out .1s infinite}" +
        "@keyframes wipMeter{0%,100%{transform:scaleY(.45)}35%{transform:scaleY(1)}70%{transform:scaleY(.6)}}" +
        /* foley — a pair of shoes walks out and back under the boom.
           Travel is pure horizontal (the old diagonal lifts made it jitter). */
        ".wip-steps{animation:stepsForthBack 6.4s ease-in-out infinite}" +
        "@keyframes stepsForthBack{0%,14%{transform:translateX(0)}50%{transform:translateX(36px)}86%,100%{transform:translateX(0)}}" +
        /* each shoe steps on its own rhythm: heel push-off, swing-through,
           heel strike, roll flat — no forward drift, so nothing snaps back */
        ".wip-shoe-back,.wip-shoe-front{transform-box:fill-box;transform-origin:center bottom}" +
        ".wip-shoe-back{animation:shoeStep 1.2s ease-in-out infinite}" +
        ".wip-shoe-front{animation:shoeStep 1.2s ease-in-out .6s infinite}" +
        "@keyframes shoeStep{0%,100%{transform:translateY(0) rotate(0deg)}16%{transform:translateY(-3px) rotate(14deg)}38%{transform:translateY(-11px) rotate(-8deg)}60%{transform:translateY(-2px) rotate(-15deg)}82%{transform:translateY(0) rotate(-2deg)}}" +
        /* ADR — the reading highlight steps down the script lines; the
           actor nods subtly; waves pulse from them toward the mic */
        ".wip-adr-read{animation:adrRead 4.8s ease-in-out infinite}" +
        "@keyframes adrRead{0%,6%{opacity:0;transform:translate(0,0)}14%,30%{opacity:1;transform:translate(0,0)}46%{transform:translate(0,12px)}62%{transform:translate(0,24px)}78%,88%{opacity:1;transform:translate(0,36px)}100%{opacity:0;transform:translate(0,36px)}}" +
        ".wip-adr-nod{animation:adrNod 2.4s ease-in-out infinite}" +
        "@keyframes adrNod{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}" +
        ".wip-adr-wave-a{animation:wavePulse 1.8s ease-out infinite}" +
        ".wip-adr-wave-b{animation:wavePulse 1.8s ease-out .5s infinite}" +
        ".wip-adr-wave-c{animation:wavePulse 1.8s ease-out 1s infinite}" +
        /* post console faders */
        ".wip-console-a{animation:wipMix 3.4s ease-in-out infinite}" +
        ".wip-console-b{animation:wipMix 3.4s ease-in-out .5s infinite}" +
        ".wip-console-c{animation:wipMix 3.4s ease-in-out .9s infinite}" +
        ".wip-console-d{animation:wipMix 3.4s ease-in-out 1.5s infinite}" +
        ".wip-console-e{animation:wipMix 3.4s ease-in-out 2.2s infinite}" +
        "@keyframes wipMix{0%,100%{transform:translateY(12px)}50%{transform:translateY(-14px)}}" +
        /* music editing playhead sweep */
        ".wip-playhead{animation:wipPlayhead 6.5s ease-in-out infinite}" +
        "@keyframes wipPlayhead{0%,12%{transform:translateX(0)}88%,100%{transform:translateX(248px)}}" +
        /* gamepad sound shock — rings expand from the impact point */
        ".wip-ring-a,.wip-ring-b,.wip-ring-c{transform-box:fill-box;transform-origin:center}" +
        ".wip-ring-a{animation:wipRing 1.9s ease-out infinite}" +
        ".wip-ring-b{animation:wipRing 1.9s ease-out .63s infinite}" +
        ".wip-ring-c{animation:wipRing 1.9s ease-out 1.26s infinite}" +
        "@keyframes wipRing{0%{transform:scale(.2);opacity:.9}60%{opacity:.4}100%{transform:scale(1.7);opacity:0}}" +
        /* composition notes */
        ".wip-note-a{animation:noteFloat 3.6s ease-in-out infinite}" +
        ".wip-note-b{animation:noteFloat 3.6s ease-in-out .6s infinite}" +
        ".wip-note-c{animation:noteFloat 3.6s ease-in-out 1.2s infinite}" +
        "@keyframes noteFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}" +
        /* field mic waves */
        ".wip-wave-a{animation:wavePulse 2.4s ease-out infinite}" +
        ".wip-wave-b{animation:wavePulse 2.4s ease-out .4s infinite}" +
        ".wip-wave-c{animation:wavePulse 2.4s ease-out .8s infinite}" +
        "@keyframes wavePulse{0%{opacity:0}30%{opacity:.85}100%{opacity:0}}" +
        ".wip-blink{animation:blink 1s steps(1) infinite}" +
        ".wip-blink2{animation:blink 1.4s steps(1) infinite}" +
        "@media (prefers-reduced-motion: reduce){" +
        ".wip-fader-cap,.wip-meters rect,.wip-steps,.wip-shoe-back,.wip-shoe-front,.wip-console-a,.wip-console-b,.wip-console-c,.wip-console-d,.wip-console-e," +
        ".wip-playhead,.wip-ring-a,.wip-ring-b,.wip-ring-c,.wip-note-a,.wip-note-b,.wip-note-c," +
        ".wip-adr-read,.wip-adr-nod,.wip-adr-wave-a,.wip-adr-wave-b,.wip-adr-wave-c," +
        ".wip-wave-a,.wip-wave-b,.wip-wave-c,.wip-blink,.wip-blink2{animation:none!important}}" ;
    document.head.appendChild(style);

    render();
})();
