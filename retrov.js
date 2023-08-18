/* RetroV - A retro-style "vanilla JS" VDOM template library.
 * MIT License - Copyright 2023 David Gauer (ratfactor.com)
 */
(function RetroV(){
    var create_callbacks = [];

    function user_render(dom_container, v){
        var dom_index = 0;

        // Convert the user array to internal object tree representation.
        var new_v = make_obj(v);
        var old_v; // default is undefined

        if(dom_container.rv_old_v){
            // We've been here before, load old vnode tree
            old_v = dom_container.rv_old_v;
        }
        else
        {
            // First time here, clear this DOM element
            dom_container.replaceChildren();
        }

        // Save the new one as next run's "old"
        dom_container.rv_old_v = new_v;

        // Call internal render function with old/new.
        // Sibling 0 (dom_index) on first run in container.
        render(dom_container, old_v, new_v, dom_index);

        // If any 'oncreate' functions were found, call
        // them now:
        create_callbacks.forEach(function(cc){
            cc.fn(cc.el);
        });
        cc = [];
    }

    function render(dom_container, old_v, new_v, dom_index){
        //   old | new | Action
        //  -----+-----+-----------------------------------------
        //    A  |     | Remove old
        //    *  |false| Boolean 'false' means "no change"
        //    *  |  [  | Array, render each child as sibling
        //       |  A  | Append to container_dom
        //    B  |  A  | Replace old with new
        //    A  |  A  | update() old with new props and children

        var child = dom_container.childNodes[dom_index];

        if(typeof new_v === 'undefined'){
            // No new node here, we must be a sibling that has been removed.
            dom_container.removeChild(child);
            return;
        }

        if(new_v.t === false){
            if(typeof old_v === 'undefined'){
                dom_container.append(placeholder('false'));
            }
            return;
        }

        if(new_v.t === '['){
            // An array here represents ALL children of the current node.

            if(new_v.c.length === 0){
                // Special: the new array is empty!
                dom_container.replaceChildren(placeholder('array'));
                return;
            }

            var old_siblings = (old_v && old_v.c ? old_v.c : []);

            resolve_siblings(dom_container, old_siblings, new_v.c);

            return;
        }

        if(typeof old_v === 'undefined'){
            // No old node here, append new to container
            dom_container.appendChild(create(new_v));
            return;
        }

        if(old_v.t !== new_v.t){
            // Different types, replace old with new
            child.replaceWith(create(new_v));
            return;
        }

        // null or undefined placeholder updated with same, nothing to do
        if(!new_v.t || new_v.t === '!'){
            return;
        }

        // They must be the same type, update props and children
        update(child, old_v, new_v);
    }

    function create(v){
        if(v.t === '"'){
            return document.createTextNode(v.text);
        } 

        if(v.t === null){
            return placeholder('null');
        }

        if(v.t === false){
            return placeholder('false');
        }

        if(v.t === '!'){
            return placeholder('undefined');
        }

        if(v.t === '<'){
            return create_html(v.html);
        }

        // Else we're creating a normal element
        try{
            var el = document.createElement(v.t);
        } catch(e) {
            if(e instanceof DOMException){
                console.error("RetroV: Bad element name: ", v.t);
            }
            throw e;
        }

        // Set new element props
        Object.keys(v.p).forEach(function(k){
            if(k === 'style'){
                // Special handling for style property
                set_or_update_style(el, {}, v);
                return;
            }
            if(k === 'for'){
                // Special handling of label 'for'
                el['htmlFor'] = v.p['for'];
                return;
            }
            if(k === 'oncreate' && typeof v.p[k] === 'function'){
                // Special pseudo-event: we're creating this.
                // Pass reference to new element.
                create_callbacks.push({el:el,fn:v.p[k]});
                return;
            }
            el[k] = v.p[k];
        });

        // Append any children to new element
        v.c.forEach(function(child){
            el.append(create(child));
        });

        return el;
    }

    function create_html(html){
        // Make temporary container
        var d = document.createElement('div');
        d.innerHTML = html;

        // Note that this can only return ONE element created from
        // the HTML string. Sure, we could return an array, but then
        // our DOM child count would no longer line up with the
        // virtual tree and the program would get sad and explode.
        return d.childNodes[0];
    }

    function placeholder(t){
        return document.createComment('RV:' + t + '-placeholder');
    }

    function set_or_update_style(dom_elem, old_v, new_v){
        var old_style = (old_v.p && old_v.p.style ? old_v.p.style : {});
        Object.keys(new_v.p.style).forEach(function(sk){
            if(new_v.p.style[sk] != old_style[sk]){
                dom_elem.style[sk] = new_v.p.style[sk];
            }
        });
    }

    function update(dom_elem, old_v, new_v){
        if(!dom_elem){
            console.error('No DOM element here to update from Old:',
                old_v,' to New:',new_v);
            return;
        }

        // Text nodes just have data
        if(new_v.t === '"'){
            dom_elem.data = new_v.text;
            return;
        }

        // If it's raw HTML, don't update. Note that it *could* update.
        // If you want it to, check for changes and call create_html().
        if(new_v.t === '<'){
            return;
        }

        // Update element props
        Object.keys(new_v.p).forEach(function(k){
            if(k === 'style'){
                // Special handling for style property
                set_or_update_style(dom_elem, old_v, new_v);
                return;
            }
            if(k === 'value' || k === 'checked'){
                // Special - we *always* update form element values
                dom_elem[k] = new_v.p[k];
                return;
            }
            if(new_v.p[k] !== old_v.p[k]){
                dom_elem[k] = new_v.p[k];
            }
        });

        // Now recurse into element children
        resolve_siblings(dom_elem, old_v.c, new_v.c);
    }

    function resolve_siblings(dom_elem, olds, news){
        if(olds.length > news.length){
            // If we'll be removing, we need to go in *reverse*!
            for(var i=olds.length-1; i>=0; i--){
                render(dom_elem, olds[i], news[i], i);
            }
        }
        else{
            for(var i=0; i<news.length; i++){
                render(dom_elem, olds[i], news[i], i);
            }
        }
    }

    function make_obj(v){
        // Turn everything into a {t:<type>,...} object so we can
        // easily compare t between objects later.
        // Note: make_obj() and make_children() are co-recursive.
        if(typeof v === 'string' || typeof v === 'number'){
            return {t:'"', text:v};
        }
        if(Array.isArray(v) && typeof v[0] !== 'string'){
            return {t:'[', c:v.map(make_obj)};
        }
        if(Array.isArray(v) && typeof v[0] === 'string' && v[0][0] === '<'){
            return {t:'<', html:v};
        }
        if(v === null){
            return {t:null};
        }
        if(v === false){
            return {t:false};
        }
        if(v === undefined){
            return {t:'!'};
        }
        if(Array.isArray(v) && typeof v[0] === 'string'){
            // This is a regular element vnode.
            var child_start = 1;
            var props = {};
            if(v[1] && typeof v[1] === 'object' && !Array.isArray(v[1])){
                props = v[1];
                if(typeof props['class'] !== 'undefined'){
                    props['className'] = props['class'];
                    delete props['class'];
                }
                if(typeof props['for'] !== 'undefined'){
                    props['htmlFor'] = props['for'];
                    delete props['for'];
                }
                child_start = 2;
            }

            // Decode classes (e.g. "div.message.bold"):
            var tag = v[0];
            var myclasses = [];
            var m = tag.split('.');
            var mytag = m.shift();
            if(mytag.length === 0) {
              mytag = 'div';
            }
            m.forEach(function (v) {
                myclasses.push(v);
            });
            if(myclasses.length > 0){
                // append to className (if that was defined as prop already)
                props.className = props.className ?
                    props.className + ' ' + myclasses.join(' ')
                    : myclasses.join(' ');
            }

            var children = make_children(v.slice(child_start));

            return {t:mytag, p:props, c:children};
        }

        console.error("RetroV: make_obj() cannot handle this:",v);
    }

    function make_children(vlist){
        var objs = [];
        vlist.forEach(function(v){
            if(!Array.isArray(v) || typeof v[0] === 'string'){
                objs.push(make_obj(v));
            }
            else{
                // This is a list in our list! Flatten by making
                // these children recursively and adding them.
                make_children(v).forEach(function(flat_v){
                    objs.push(flat_v);
                });
            }
        });
        return objs;
    }

    // Export interface object with our single glorious method!
    window.RV = { render: user_render };
})();
