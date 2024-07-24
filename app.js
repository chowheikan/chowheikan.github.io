// app.js
$(document).ready(function() {
    let table1, table2;

    $('#fileInput1').on('change', function(event) {
        handleFileUpload(event, '#jsonInput1');
    });

    $('#fileInput2').on('change', function(event) {
        handleFileUpload(event, '#jsonInput2');
    });

    $('#updateTable1').on('click', function() {
        const jsonData = $('#jsonInput1').val();
        createTable(JSON.parse(jsonData), '#table1');
    });

    $('#updateTable2').on('click', function() {
        const jsonData = $('#jsonInput2').val();
        createTable(JSON.parse(jsonData), '#table2');
    });

    $('#compareBtn').on('click', function() {
        compareTables();
    });

    $('#clearHighlightBtn').on('click', function() {
        clearHighlight();
    });

    function handleFileUpload(event, textAreaSelector) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            $(textAreaSelector).val(e.target.result);
        };

        reader.readAsText(file);
    }

    function createTable(data, tableSelector) {
        const columns = Object.keys(data[0]).map(key => ({ title: key, data: key }));
        
        if (tableSelector === '#table1') {
            if (table1) table1.destroy();
            table1 = $(tableSelector).DataTable({
                data: data,
                columns: columns
            });
        } else {
            if (table2) table2.destroy();
            table2 = $(tableSelector).DataTable({
                data: data,
                columns: columns
            });
        }
    }

    function compareTables() {
        const data1 = table1.rows().data().toArray();
        const data2 = table2.rows().data().toArray();
        const order = table1.order();
        const sortingColumnIndex = order[0][0];
        const sortingColumnName = table1.column(sortingColumnIndex).header().innerHTML;

        const map1 = new Map(data1.map(item => [item[sortingColumnName], item]));
        const map2 = new Map(data2.map(item => [item[sortingColumnName], item]));
        
        // Highlight rows
        map1.forEach((row1, key) => {
            const row2 = map2.get(key);
            if (!row2) {
                highlightRow('#table1', key, 'highlight-red', sortingColumnName);
            } else if (JSON.stringify(row1) !== JSON.stringify(row2)) {
                highlightRow('#table1', key, 'highlight-yellow', sortingColumnName);
                highlightRow('#table2', key, 'highlight-yellow', sortingColumnName);
            }
        });

        map2.forEach((row2, key) => {
            if (!map1.has(key)) {
                highlightRow('#table2', key, 'highlight-green', sortingColumnName);
            }
        });
    }

    function highlightRow(tableSelector, key, highlightClass, sortingColumnName) {
        const rowIndex = $(tableSelector).DataTable().rows().indexes().filter((idx) => {
            return $(tableSelector).DataTable().row(idx).data()[sortingColumnName] === key;
        });
        $(tableSelector).DataTable().rows(rowIndex).nodes().to$().addClass(highlightClass);
    }

    function clearHighlight() {
        $('#table1 tbody tr').removeClass('highlight-yellow highlight-green highlight-red');
        $('#table2 tbody tr').removeClass('highlight-yellow highlight-green highlight-red');
    }
});
