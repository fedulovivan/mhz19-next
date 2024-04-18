// // import the module
// const mdns = require('mdns');

// // advertise a http server on port 4321
// // const ad = mdns.createAdvertisement(mdns.tcp('http'), 4321);
// // ad.start();

// // watch all http servers
// const browser = mdns.createBrowser(mdns.tcp('http'));
// browser.on('serviceUp', service => {
//   console.log("service up: ", service);
// });
// browser.on('serviceDown', service => {
//   console.log("service down: ", service);
// });
// browser.start();

var mdns = require('multicast-dns')()

mdns.on('response', function (response) {
    const { answers } = response;
    console.log('answers:');
    answers.forEach(answer => {

        const { type, data } = answer;

        if (type === 'A') {
            console.log('ip', answer.data);
        }
        if (type === 'SRV') {
            console.log('port', answer.data.port);
        }
        if (typeof data.forEach === 'function') {
            data.forEach((dd) => {
                if (dd instanceof Buffer) {
                    const bufString = dd.toString('utf8');
                    if (bufString.startsWith('data1=')) {
                        console.log('json attrs', bufString.slice(5));
                    }
                    if (bufString.startsWith('id=')) {
                        console.log('id', bufString.slice(3));
                    }
                }
            });
        }

        // const { data } = answer;
        // if (typeof data === 'string') {
        //     console.log('string:', data);
        // } else if (typeof data.forEach === 'function') {
        //     data.forEach((dd, index) => {
        //         if (dd instanceof Buffer) {
        //             console.log(`Buffer.${index}:`, dd.toString('utf8'));
        //         }
        //     });
        // } else {
        //     console.log('other', JSON.stringify(data));
        // }

    });
});

// mdns.on('query', function (query) {
//     console.log('got a query packet:', query);
// });

// lets query for an A record for 'brunhilde.local'
mdns.query({
    questions: [{
        name: '_ewelink._tcp.local',
        type: 'A'
    }]
});
