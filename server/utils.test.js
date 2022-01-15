const { isReadyToRun } = require("./utils");

test('Will signal to run the scan',()=>{
    const lastBackedUpDate = new Date('01/01/2022').toISOString();
    expect(isReadyToRun(lastBackedUpDate)).toBe(true);
})

test('Will signal not to run the scan',()=>{
    const lastBackedUpDate = new Date().toISOString();
    expect(isReadyToRun(lastBackedUpDate)).toBe(false);
})
