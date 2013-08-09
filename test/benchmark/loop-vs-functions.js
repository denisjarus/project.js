function benchmark(name, iterations, test) {
    addEventListener('load', function() {
        var button = document.body.appendChild(document.createElement('button'));
        button.appendChild(document.createTextNode(name));

        button.onclick = function() {
            var start = performance.now();
            for (var i = 0; i < iterations; i++) {
                test();
            }
            console.log(name, performance.now() - start);
        }
    });
}

// setting uniforms in a loop

var someVar = 0;

function setValue(value) {
    someVar = value;
}

var setter = Object.defineProperty({}, 'value', {
    set: function(value) {
        someVar = value;
    }
});

var values = [1, 2, 3, 4, 5];

benchmark('loops', Math.pow(2, 25), function() {
    for (var i = 0, len = 5; i < len; i++) {
        setValue(i);
    }
});

benchmark('functions', Math.pow(2, 25), function() {
    setter.value = 1;
    setter.value = 2;
    setter.value = 3;
    setter.value = 4;
    setter.value = 5;
});

benchmark('each', Math.pow(2, 25), function() {
    values.forEach(setValue);
})
