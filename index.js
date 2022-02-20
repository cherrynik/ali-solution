/*
`{
    {
        "Name": 'foo1',
        "GroupId": 4,
    },
    {
        "Name": 'foo2'
        "GroupId": 4,
    },
    {
        "Name": 'foo3',
        "GroupId": 4,
    },

    {
        "Name": 'bar1',
        "GroupId": 10,
    },
    {
        "Name": 'bar2'
        "GroupId": 10,
    },
    {
        "Name": 'bar3',
        "GroupId": 10,
    },
}`;
*/

// Parentizing objects
/*
`{
    "4": ['foo1', 'foo2', 'foo3'],
    "10": ['bar1', 'bar2', 'bar3'],
    "12": ['foobar1', 'foobar2', 'foobar3']
}`
*/

// In each group might be the only one active element.
/*
`{
    "4": 'foo2',
    "10": 'bar1',
    "12": 'foobar3'
}`
*/

// If inside of an element was selected some other element to be active what cannot be crossed with current, then disable current

const data = {
    // '"color": {
        "1": {
            "3": false,
            "4": null,

            "5": null,
            "6": null,
            "instock": true,
            "disabled": true,
            "active": false,
        },
        "2": {
            "3": true,
            "4": false,

            "5": false,
            "6": null,
            "instock": false,
            "disabled": false,
            "active": false,
        },
    // },

    // '"size": {
        "3": {
            "1": true,
            "2": true,

            "5": null,
            "6": null,
            "instock": true,
            "disabled": false,
            "active": false,
        },
        "4": {
            "1": true,
            "2": false,

            "5": true,
            "6": true,
            "instock": true,
            "disabled": false,
            "active": false,
        },
    // },

    // '"shipment": {
        "5": {
            "1": true,
            "2": true,

            "3": true,
            "4": false,
            "instock": true,
            "disabled": false,
            "active": false,
        },
    

        "6": {
            "1": true,
            "2": true,

            "3": false,
            "4": true,
            "instock": true,
            "disabled": false,
            "active": false,
        }
    // }
};

// When selecting any, you just keep active all the elements, what are in stock in current included case combination
// import './combo.js'; // Click on the file

// And disabling anothers, what are out of stock with the given combo
// (as more options selected, as more particular order is and as more specific price it has)

// An element from each group must be available to select with one any minimal all-groups-selected combo.
// Else if even one option cannot be selected then all another combos what has no other options disabled

// You also can't select potentially unavailable option followed.
// U just pass through your choice with already calculated right way.
// So, when you select, your next options will be always available.
// So, you won't ever step on interrupted choice way. They're disabled by default.

// "https"://aliexpress.ru/item/1005003116897836.html?spm=a2g2w.detail.0.0.3b819a81Vn0VNW&_evo_buckets=165609,165598,188872,224373,176818,194275&sku_id=12000026932310855&gps-id=pcDetailBottomMoreThisSeller&scm=1007.13339.169870.0&scm_id=1007.13339.169870.0&scm-url=1007.13339.169870.0&pvid=b5f03448-c302-48bc-b85f-1521ea39bc1c&_t=gps-"id":pcDetailBottomMoreThisSeller,scm-"url":1007.13339.169870.0,"pvid":b5f03448-c302-48bc-b85f-1521ea39bc1c,"tpp_buckets":21387%230%23233228%232
// "https"://aliexpress.ru/item/1005003204836541.html?spm=a2g2w.detail.0.0.124d84c0nfJTtB&_evo_buckets=165609,165598,188872,224373,176818,194275&sku_id=12000025794173590&gps-id=pcDetailBottomMoreThisSeller&scm=1007.13339.169870.0&scm_id=1007.13339.169870.0&scm-url=1007.13339.169870.0&pvid=fa7ac6cf-9bc6-4a73-a707-75f7ca15b4fd&_t=gps-"id":pcDetailBottomMoreThisSeller,scm-"url":1007.13339.169870.0,"pvid":fa7ac6cf-9bc6-4a73-a707-75f7ca15b4fd,"tpp_buckets":21387%230%23233228%239

/*
 * [
    [1, 2, 3],
    [10, 11],
    [100, 101]
 * ]
 */

const GetObjectDependencies = (object) => {
    const deps = Object.keys(object);
    deps.splice(deps.length - 3);
    return deps;
}

const SayItsDependenciesTheyCannotBeWithThis = (row, value) => {
    const deps = GetObjectDependencies(row[value]);

    for (const key in row) {
        if (deps.includes(key)) {
            row[key][value] = false;
        }
    }
}

const HearFromDependenciesTheirSolution = (row, value) => {
    const deps = GetObjectDependencies(row[value]);

    for (const key in row[value]) {
        if (deps.includes(key) && !row[key].disabled && row[value][key] !== false) {
            row[value][key] = row[key][value];
        } else if (deps.includes(key) && row[key].disabled) {
            row[value][key] = false;
            row[key][value] = false;
        }
    }
}

const DoStatusOfDependenciesOfRowAndRowInThem = (row) => {
    for (const value in row) {
        if (row[value].disabled || !row[value].instock) {
            row[value].disabled = true;
            SayItsDependenciesTheyCannotBeWithThis(row, value);
        } else {
            HearFromDependenciesTheirSolution(row, value);
        }
    }
}

const CheckIfHasAnyWay = (row) => {
    DoStatusOfDependenciesOfRowAndRowInThem(row);
    
    for (const value in row) {
        let disabled = 0;
        let isAnyUnavailableActivated = false;
        const deps = GetObjectDependencies(row[value]);

        // Check if completely NO available dependency
        for (const dep of deps) {
            if (row[value][dep] === false) {
                ++disabled;

                if (row[dep].active) {
                    row[value].disabled = true;
                    isAnyUnavailableActivated = true;
                }
            }
        }

        if (disabled === deps.length) {
            row[value].disabled = true;
        } else if (!isAnyUnavailableActivated && row[value].disabled && row[value].instock) {
            row[value].disabled = false;
        }
    }
}

const getCombinations = (row) => {
    console.log(row);
    CheckIfHasAnyWay(row);
    console.log(row);
}

getCombinations(data);