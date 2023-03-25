/* RetroV - A retro-style "vanilla JS" VDOM template library.
 * MIT License - Copyright 2023 David Gauer (ratfactor.com)
 */
(function RetroV(){

    function user_render(dom_container, v){
        var dom_index = 0;

        // Convert the user array to internal object tree representation.
        var new_v = make_obj(v);
        var old_v; // default is undefined

        // Load any "old" vnode tree
        if(dom_container.rv_old_v){
            old_v = dom_container.rv_old_v;
        }

        // Save the new one as next run's "old"
        dom_container.rv_old_v = new_v;

        // Call internal render function with old/new.
        // Sibling 0 (dom_index) on first run in container.
        render(dom_container, old_v, new_v, dom_index);
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
                // this could arguably be an error condition???
                dom_container.append(
                    document.createComment("RV:false-placeholder"));
            }
            return;
        }

        if(new_v.t === '['){
            // Special array handling: An array here represents ALL children
            // of the current node.
            var old_siblings = [];

            if(old_v && old_v.t === '['){
                old_siblings = old_v.c;
            }

            var len = Math.max(old_siblings.length, new_v.c.length);

            if(old_siblings.length > new_v.c.length){
                // Removing, go in reverse to remove from the end!
                // go in reverse!
                for(var i=len-1; i>=0; i--){
                    render(dom_container, old_siblings[i], new_v.c[i], i);
                }
            }
            else{
                // Adding or updating, go forward!
                for(var i=0; i<len; i++){
                    render(dom_container, old_siblings[i], new_v.c[i], i);
                }
            }

            if(new_v.c.length === 0){
                // Special: the new array is empty!
                dom_container.replaceChildren(
                    document.createComment("RV:empty-array"));
            }

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

        if(old_v.t === new_v.t){
            // Same type, update props and children
            update(child, old_v, new_v);
            return;
        }
    }

    function create(v){
        if(v.t === '"'){
            return document.createTextNode(v.text);
        } 

        if(v.t === null){
            return document.createComment("RV:null-placeholder");
        }

        if(v.t === false){
            return document.createComment("RV:false-placeholder");
        }

        // Looks like we're creating a normal element
        var el = document.createElement(v.t);

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
            }
            el[k] = v.p[k];
        });

        // Append any children to new element
        v.c.forEach(function(child){
            el.append(create(child));
        });

        return el;
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
        // Text nodes just have data
        if(new_v.t === '"'){
            dom_elem.data = new_v.text;
            return;
        }

        // Update element props
        // TODO: As another todo below states, this is nearly identical
        // to the create logic for properties above (minus the check for
        // old vs new properties...), see if we can extract 'em out.
        Object.keys(new_v.p).forEach(function(k){
            if(k === 'style'){
                // Special handling for style property
                set_or_update_style(dom_elem, old_v, new_v);
                return;
            }
            if(k === 'for'){
                // Special handling of label 'for'
                dom_elem['htmlFor'] = new_v.p['for'];
            }
            if(k === 'value'){
                // Special - we always update input value
                dom_elem['value'] = new_v.p['value'];
            }
            if(new_v.p[k] !== old_v.p[k]){
                dom_elem[k] = new_v.p[k];
            }
        });

        // Now recurse into element children
        var len = Math.max(old_v.c.length, new_v.c.length);

        // TODO: This logic is pretty much identical with the
        // array add/update/remove loops in render(). Can they
        // be teased out?
        if(old_v.c.length > new_v.c.length){
            // if we'll be REMOVING, we need to go in reverse!
            for(var i=len-1; i>=0; i--){
                render(dom_elem, old_v.c[i], new_v.c[i], i);
            }
        }
        else{
            for(var i=0; i<len; i++){
                render(dom_elem, old_v.c[i], new_v.c[i], i);
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
        if(v === null){
            return {t:null};
        }
        if(v === false){
            return {t:false};
        }
        if(Array.isArray(v) && typeof v[0] === 'string'){
            var child_start = 1;
            var props = {};
            if(typeof v[1] === 'object' && !Array.isArray(v[1])){
                props = v[1];
                child_start = 2;
            }

            var tag = v[0];
            // Decode classes (e.g. "div.message.bold"):
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

        console.error("make_obj() cannot handle this:",v);
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
