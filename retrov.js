/* RetroV - A retro-style "vanilla JS" VDOM template library.
 * MIT License - Copyright 2023 David Gauer (ratfactor.com)
 */
(function RetroV(){
    var IS_CHILD = -42;

    // TODO: vnode param isn't a great name because it could be
    // a string, function, number.
    //
    function render(container, vnode, is_child){

        if(is_child !== IS_CHILD){
            // Temporary: Clear the root node every time we draw.
            container.replaceChildren();
        }

        if(typeof vnode === 'number'){
            vnode = vnode.toString();
        }
        if(typeof vnode === 'string'){
            var me = document.createTextNode(vnode);
            container.append(me);
            return;
        }

        if(typeof vnode === 'function'){
            render(container, vnode(), IS_CHILD);
            return;
        }

        // Head of array ALWAYS the element type (e.g. "div")
        var element = vnode.shift();

        // If we made it this far, we're a VNode array
        //
        // Is the second thing a properties object?
        var props = (typeof vnode[0] === 'object' && !Array.isArray(vnode[0]))
            ? props = vnode.shift()
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
        vnode.forEach(function(c){
            render(new_elem, c, IS_CHILD);
        });

        container.append(new_elem);
    }

    window.RV = { render: render };
})();
