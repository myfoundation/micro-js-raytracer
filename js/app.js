(function () {
    'use strict';


    var canvas;
    var context;

    var width;
    var height;

    var imageData;

    var G = [247570,280596,280600,249748,18578,18577,231184,16,16];

    function draw () {
        var g = vector.normalize([-6, -16, 0]);
        var a = vector.scale(
            vector.normalize(
                vector.cross([0, 0, 1], g)
            ),
            0.002);
        var b = vector.scale(
            vector.normalize(
                vector.cross(g, a)
            ),
            0.002);
        var c = vector.add(
            vector.scale(
                vector.add(a, b),
                -256),
            g);
        
        var p, y, x, r, t;
        
        for (y = 0; y < height; ++y) {
            for (x = 0; x < width; ++x) {
                p = [13, 13, 13];
                for (r = 0; r < 64; ++r) {
                    t = vector.add(
                        vector.scale(
                            vector.scale(a, Math.random() - 0.5),
                            99
                        ),
                        vector.scale(
                            vector.scale(b, Math.random() - 0.5),
                            99
                        )
                    );

                    

                    p = vector.add(vector.scale(sample(
                        vector.add([17, 16, 8], t),
                        vector.normalize(
                            vector.add(
                                vector.scale(t, -1),
                                vector.scale(
                                    vector.add(
                                        vector.add(
                                            vector.scale(a, Math.random() + x),
                                            vector.scale(b, Math.random() + y)
                                        ),
                                        c
                                    ),
                                    16
                                )
                            )
                        )
                    ), 3.5), p);
                }

                

                putPixel(imageData, x, y, [p[0], p[1], p[2], 255]);
                
            }
        }

        context.putImageData(imageData, 0, 0);

    }

    function sample (o, d) {
        var tn = {
            t: 0,
            n: [0, 0, 0]
        };

        var m = trace(o, d, tn);

        var h, l, r;
        var b, p;

        if (m === 0) {
            return vector.scale([0.7, 0.6, 1], Math.pow(1 - d[2], 4));
        }

        h = vector.add(o, vector.scale(d, tn.t));
        
        
        l = vector.normalize(
          vector.add(
              [Math.random() + 9, Math.random() + 9, 16],
              vector.scale(h, -1)));

        r = vector.add(
            d, vector.scale(tn.n, vector.dot(tn.n, d) * -2));
        
        b = vector.dot(l, tn.n);

        if (b < 0 || trace(h, l, tn)) {
            b = 0;
        }

        p = Math.pow(vector.dot(l, r) * (b > 0 ? 1 : 0), 99);

        if (m === 1) {
            h = vector.scale(h, 0.2);
            
            if (Math.ceil(h[0]) + Math.ceil(h[1]) & 1) {
                console.log('red');
                return vector.scale([3, 1, 1], b * 0.2 + 0.1);
            } else {
                return vector.scale([3, 3, 3], b * 0.2 + 0.1);
            }
        }

        return vector.add([p, p, p], vector.scale(sample(h, r), 0.5));

    }

    function trace (o, d, tn) {
        var m = 0;
        var p = -o[2] / d[2];
        var k, j;

        tn.t = 1e9;

        var pp;
        var b, c, q, s;

        if (p > 0.01) {
            tn.t = p;
            tn.n = [0, 0, 1];
            m = 1;
        }


        for (k = 0; k < 19; ++k) {
            for (j = 0; j < 9; ++j) {
                if (G[j] & 1 << k) {
                    pp = vector.add(o, [-k, 0, -j - 4]);
                    b = vector.dot(pp, d);
                    c = vector.dot(pp, pp) - 1;
                    q = b * b - c;

                    if (q > 0) {
                        s = -b - Math.sqrt(q);

                        if (s < tn.t && s > 0.01) {
                            tn.t = s;
                            tn.n = vector.normalize(
                                vector.add(pp, vector.scale(d, tn.t)));
                            m = 2;
                        }
                    }
                }
            }
        }

        return m;
    }

    function init () {
        canvas = document.getElementById('cnvs');
        context = canvas.getContext('2d');

        width = canvas.width;
        height = canvas.height;

        imageData = context.createImageData(width, height);
        for (var i = 0; i < width; ++i) {
            putPixel(imageData, i, i, [255, 0, 0, 255]);
        }
        context.putImageData(imageData, 0, 0);

        vectorTest();
        draw();
        
    }

    function putPixel (imageData, x, y, color) {
        var dim = [imageData.width, imageData.height];
        var i;
        var offset;
        

        if (x >= dim[0] || y >= dim[1]) {
            console.error('Error: Attempting to draw pixel at [' + x + ', ' + y + '] which is outside ImageData dimensions [' + width + ' ' + height +  '].');
            return;
        }

        offset = (dim[0] * y + x) * 4;
        
        for (i = 0; i < color.length; ++i) {
            imageData.data[offset + i] = color[i];
        }
    }

    var vector = {
        add: function add (lv, rv) {
            return [lv[0] + rv[0], lv[1] + rv[1], lv[2] + rv[2]];
        },
        scale: function scale (lv, rs) {
            return [lv[0] * rs, lv[1] * rs, lv[2] * rs];
        },
        dot: function dot (lv, rv) {
            return lv[0] * rv[0] + lv[1] * rv[1] + lv[2] * rv[2];
        },
        cross: function cross (lv, rv) {
            return [
                lv[1] * rv[2] - lv[2] * rv[1],
                lv[2] * rv[0] - lv[0] * rv[2],
                lv[0] * rv[1] - lv[1] * rv[0]];
        },
        normalize: function normalize (v) {
            return vector.scale(v, 1 / Math.sqrt(vector.dot(v, v)));
        }
    };

    function vectorTest() {
        var v1 = [1, 2, 1];
        var v2 = [2, 3, 4];
        var s = 3;
        console.log("add", vector.add(v1, v2));
        console.log("scale", vector.scale(v1, s));
        console.log("dot", vector.dot(v1, v2));
        console.log("cross", vector.cross(v1, v2));
        console.log("normalize", vector.normalize(v1));
    }

    window.addEventListener('load', init);
}());