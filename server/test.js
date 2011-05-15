var foo = function bar() {
    function processMessages(message) {
        return "Message: " + message;
    }
    return {
        init: function () {
            return processMessages('test');
        }
    };
}();

console.log(foo.init());

var obj = bar();
console.log(obj.init());