<img src="./retrov.svg" alt="RetroV 1970s colors svg logo">

# RetroV

A retro-style "vanilla JS" VDOM template library.

* No `h()` function, templates are pure JS data.
* Codebase is charmingly anachronistic!
* Browser only, install by including in a script tag!

## Work in Progress

At the time of this writing, this code is `1` day old.
Here's what works so far:

* Data structure definition for VNodes seems good so far.
* Visual test/demo page with some basic rendering examples.
* DOM events and re-rendering a section seem fine.


## Example

Take a look at `test.html` in this repo for examples, but here's
a quick glimpse:

```
<html><body>
<script src="retrov.js"></script>
<script>
RV.render(
    document.body,
    ['div',
        ['h1', 'Hello'],
        ['p', 'Hello world, this is ',
            ['em', 'RetroV'],
            '!',
        ]
    ]
);
</script>
```

## Why?

Couldn't find anything exactly like it. Lots of bits and pieces
I liked, but not this exact thing.

## Inspiration

[https://github.com/wavesoft/dot-dom/blob/master/src/dotdom.js](.dom)
Full hyperscript and DOM diff in 512 bytes! A direct inspiration. In fact, I
was originally going to fork this and change it to suit my preferences until I
decided to go in a radically different direction for VNode creation.

[https://github.com/MithrilJS/mithril.js/blob/next/mithril.js](Mithril)
My old favorite, still getting updates. This is how I learned these practices
and it's the standard by which I judge them.

[https://github.com/lukejacksonn/ijk](ijk)
DOM without the 'h()' function - pure JS data structures.
I _think_ I'd seen this concept before, but maybe not. At any rate, this
has heavily influenced RetroV. This library is for transforming data,
not rendering. Super compact code!

[https://github.com/hyperhype/hyperscript/blob/master/index.js](Hyperscript)
Hyperscript renderer only, no VDom. Nice single-file JavaScript code!

[https://github.com/WebReflection/udomdiff/blob/main/index.js](udomdiff)
(I'm not diffing at the time of this writing.)
Just DOM diffing, wonderfully concise and _very_ readable code.
