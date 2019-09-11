context('Full test', () => {

    it('Scenario where a complete agenda is created', () => {
    });

});



const generateRandomId = (amount)=>{
    let chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let string = '';
    for(let i=0; i<amount; i++){
        string += chars[Math.floor(Math.random() * chars.length)];
    }
    return string;
}