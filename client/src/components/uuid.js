//Special thanks to whoever wrote this javvascript that was handed to me
//start randomize number
function randomizeX() {
    var base = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    var d, returnValue, r;

    d = new Date().getTime();
    returnValue = base.replace(/[xy]/g, function (c) {
        r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);

        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });

    return returnValue;
};
export default randomizeX;
