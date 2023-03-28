<img src="./retrov.svg" alt="RetroV 1970s colors svg logo">

# RetroV

RetroV (pronounced "retro vee") is a virtual DOM (VDOM) rendering library.
It is browser-native and has no dependencies or build system.

It’s tiny: **1129 bytes** (the usual minified gzipped metric).

Read more on the World Wide Web here:

http://ratfactor.com/retrov/

## Installation

```
<script src="retrov.js"></script>
```

## Example

Here's a quick glimpse (a whole web page!):

```
<!DOCTYPE html>
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

For more examples and fairly complete **tutorial**, take a look at
at `demo.html` in this repo or see it live here:

http://ratfactor.com/retrov/demo.html

You can also run the test suite `test.html` or run it live:

http://ratfactor.com/retrov/test.html


## Why?

I couldn't find anything exactly like it. Lots of bits and pieces
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
