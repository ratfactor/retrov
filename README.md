<img src="./retrov.svg" alt="RetroV 1970s colors svg logo">

# RetroV

A retro-style "vanilla JS" VDOM-diffing rendering library.

* No `h()` function, templates are pure JS data.
* Browser only. (Sorry, Node users!)
* Codebase charmingly anachronistic. (`function` spoken here.)

Read more on the World Wide Web here:

http://ratfactor.com/retrov/

## Installation

```
<script src="retrov.js"></script>
```

## Example (a whole web page!)

Here's a quick a quick glimpse:

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
</body></html>
```

Take a look at `demo.html` in this repo or see it live here:

http://ratfactor.com/retrov/demo.html

You can also run the test suite `test.html` or run it live:

http://ratfactor.com/retrov/test.html


## Why?

Couldn't find anything exactly like it. Lots of bits and pieces
I liked, but not this exact thing.

## Inspiration

[.dom](https://github.com/wavesoft/dot-dom/) -
Full hyperscript and DOM diff in 512 bytes! A direct inspiration. In fact, I
was originally going to fork this and change it to suit my preferences until I
decided to go in a radically different direction for VNode creation.

[Mithril](https://github.com/MithrilJS/mithril.js/) -
My old favorite, still getting updates. This is how I learned these practices
and it's the standard by which I judge them.

[ijk](https://github.com/lukejacksonn/ijk) -
DOM without the 'h()' function - pure JS data structures.
I _think_ I'd seen this concept before, but maybe not. At any rate, this
has heavily influenced RetroV. This library is for transforming data,
not rendering. Super compact code!
