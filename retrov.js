/* RetroV - A retro-style "vanilla JS" VDOM template library.
 * MIT License - Copyright 2023 David Gauer (ratfactor.com)
 */
(function RetroV(){
    var IS_CHILD = -42;

    function render(container, new_v, is_child, old_v){
        // container - the DOM element into which we'll be rendering

        if(is_child !== IS_CHILD){
            // Temporary: Clear the root node every time we draw.
            container.replaceChildren();
            // If it's a child, we have that part of old_v, otherwise get from DOM
            old_v = container.old_vnode ? container.old_vnode : old_v;
            container.old_vnode = new_v; // new will be old next time
        }

        if(typeof new_v === 'number'){
            new_v = new_v.toString();
        }
        if(typeof new_v === 'string'){
            var me = document.createTextNode(new_v);
            container.append(me);
            return;
        }
        if(typeof new_v === 'function'){
            render(container, new_v(), IS_CHILD);
            return;
        }

        // At this point, we have to have an array
        if(!Array.isArray(new_v)){
            console.error("Oops, can't render: ", new_v);
        }

        // If first element is not a string, this array is not
        // a VNode, it's actually a list.
        if(typeof new_v[0] !== 'string'){
            new_v.forEach(function(v){
                render(container, v, IS_CHILD);
            });

            return;
        }

        // Head of array ALWAYS the element type (e.g. "div")
        var element = new_v.shift();

        // If we made it this far, we're a VNode array
        //
        // Is the second thing a properties object?
        var props = (typeof new_v[0] === 'object' && !Array.isArray(new_v[0]))
            ? props = new_v.shift()
            : props = [];

        // Add classes p.class1.class2:
        var myclasses = [];
        var m = element.split('.');
        var myelem = m.shift();
        if(myelem.length === 0) {
          myelem = 'div';
        }
        m.forEach(function (v) {
            myclasses.push(v);
        });
        if(myclasses.length > 0){
            // append (as needed) to className
            props.className = props.className ?
                props.className + ' ' + myclasses.join(' ')
                : myclasses.join(' ');
        }

        var new_elem = document.createElement(myelem);

        Object.keys(props).forEach(function(k){
            new_elem[k] = props[k];
        });

        // everything else has to be children, recursively
        // render them too
        new_v.forEach(function(c){
            render(new_elem, c, IS_CHILD);
        });

        container.append(new_elem);
    }

    window.RV = { render: render };
})();
