$(document).ready(function() {
    let table1, table2;
    let columns = [];
    let parallelScroll = false;

    $('#fileInput1').on('change', function(event) {
        handleFileUpload(event, '#jsonInput1');
    });

    $('#fileInput2').on('change', function(event) {
        handleFileUpload(event, '#jsonInput2');
    });

    $('#updateTable1').on('click', function() {
        try {
            const rawData = $('#jsonInput1').val();
            const trimmedData = trimEmptyLines(rawData);
            const jsonData = parseInput(trimmedData);
            createTable(jsonData, '#table1');
        } catch (error) {
            showError(error.message);
        }
    });

    $('#updateTable2').on('click', function() {
        try {
            const rawData = $('#jsonInput2').val();
            const trimmedData = trimEmptyLines(rawData);
            const jsonData = parseInput(trimmedData);
            createTable(jsonData, '#table2');
        } catch (error) {
            showError(error.message);
        }
    });

    $('#compareBtn').on('click', function() {
        try {
            compareTables();
        } catch (error) {
            showError(error.message);
        }
    });

    $('#clearHighlightBtn').on('click', function() {
        clearHighlight();
    });

    $('#toggleScrollBtn').on('click', function() {
        parallelScroll = !parallelScroll;
        $(this).text(parallelScroll ? "Disable Parallel Scrolling" : "Enable Parallel Scrolling");
    });

    function handleFileUpload(event, textAreaSelector) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const rawData = e.target.result;
            const trimmedData = trimEmptyLines(rawData);
            $(textAreaSelector).val(trimmedData);
        };

        reader.readAsText(file);
    }

    function trimEmptyLines(input) {
        return input.split('\n').filter(line => line.trim() !== '').join('\n');
    }

    function parseInput(input) {
        try {
            return JSON.parse(input);
        } catch (jsonError) {
            try {
                const parsed = Papa.parse(input, { header: true });
                if (parsed.errors.length) {
                    throw new Error('Error parsing CSV');
                }
                return parsed.data;
            } catch (csvError) {
                throw new Error('Invalid JSON or CSV input');
            }
        }
    }

    function createTable(data, tableSelector) {
        if (tableSelector === '#table1') {
            columns = Object.keys(data[0]);
            generateCheckboxes(columns);
        }

        const tableColumns = columns.map(key => ({ title: key, data: key }));
        
        if (tableSelector === '#table1') {
            if (table1) table1.destroy();
            table1 = $(tableSelector).DataTable({
                data: data,
                columns: tableColumns
            });
        } else {
            if (table2) table2.destroy();
            table2 = $(tableSelector).DataTable({
                data: data,
                columns: tableColumns
            });
        }
    }

    function generateCheckboxes(columns) {
        const container = $('#checkboxContainer');
        container.empty();
        columns.forEach(column => {
            container.append(`
                <div>
                    <input type="checkbox" id="checkbox-${column}" name="${column}" checked>
                    <label for="checkbox-${column}">${column}</label>
                </div>
            `);
        });
    }

    function getCheckedColumns() {
        const checkedColumns = [];
        $('#checkboxContainer input:checked').each(function() {
            checkedColumns.push($(this).attr('name'));
        });
        return checkedColumns;
    }

    function compareTables() {
        const data1 = table1.rows().data().toArray();
        const data2 = table2.rows().data().toArray();
        const order = table1.order();
        const sortingColumnIndex = order[0][0];
        const sortingColumnName = table1.column(sortingColumnIndex).header().innerHTML;
        const checkedColumns = getCheckedColumns();

        // Include sorting column in the checked columns if not already included
        if (!checkedColumns.includes(sortingColumnName)) {
            checkedColumns.push(sortingColumnName);
        }

        const map1 = new Map(data1.map(item => [item[sortingColumnName].toString(), item]));
        const map2 = new Map(data2.map(item => [item[sortingColumnName].toString(), item]));

        console.log('Comparing tables...');
        console.log('Table 1 data:', data1);
        console.log('Table 2 data:', data2);

        map1.forEach((row1, key) => {
            const row2 = map2.get(key);
            console.log('Comparing row with key:', key);
            if (!row2) {
                console.log('Key not found in Table 2:', key);
                highlightRow('#table1', key, 'highlight-red', sortingColumnName);
            } else {
                const diffColumns = getDiffColumns(row1, row2, checkedColumns);
                if (diffColumns.length > 0) {
                    console.log('Differences found for key:', key, 'in columns:', diffColumns);
                    highlightRow('#table1', key, 'highlight-yellow', sortingColumnName, diffColumns);
                    highlightRow('#table2', key, 'highlight-yellow', sortingColumnName, diffColumns);
                }
            }
        });

        map2.forEach((row2, key) => {
            if (!map1.has(key)) {
                console.log('Key not found in Table 1:', key);
                highlightRow('#table2', key, 'highlight-green', sortingColumnName);
            }
        });
    }

    function getDiffColumns(row1, row2, columns) {
        const diffColumns = [];
        for (const column of columns) {
            if (row1[column].toString() !== row2[column].toString()) {
                diffColumns.push(column);
            }
        }
        return diffColumns;
    }

    function highlightRow(tableSelector, key, highlightClass, sortingColumnName, diffColumns = []) {
        const rowIndex = $(tableSelector).DataTable().rows().indexes().filter((idx) => {
            return $(tableSelector).DataTable().row(idx).data()[sortingColumnName].toString() === key;
        });
        if (diffColumns.length > 0) {
            diffColumns.forEach(column => {
                const columnIndex = columns.indexOf(column);
                console.log('Highlighting cell at row:', rowIndex[0], 'column:', columnIndex, 'with class:', highlightClass);
                $(tableSelector).DataTable().cell(rowIndex, columnIndex).nodes().to$().addClass(highlightClass);
            });
        } else {
            console.log('Highlighting entire row:', rowIndex[0], 'with class:', highlightClass);
            $(tableSelector).DataTable().rows(rowIndex).nodes().to$().addClass(highlightClass);
        }
    }

    function clearHighlight() {
        $('#table1 tbody tr').removeClass('highlight-yellow highlight-green highlight-red');
        $('#table2 tbody tr').removeClass('highlight-yellow highlight-green highlight-red');
        $('#table1 tbody td').removeClass('highlight-yellow highlight-green highlight-red');
        $('#table2 tbody td').removeClass('highlight-yellow highlight-green highlight-red');
        $('#errorContainer').empty();
    }

    function showError(message) {
        $('#errorContainer').text(message);
    }

    function syncScroll(e) {
        if (parallelScroll) {
            const otherPanel = e.target.id === 'panel1' ? '#panel2' : '#panel1';
            $(otherPanel).scrollTop($(e.target).scrollTop());
            $(otherPanel).scrollLeft($(e.target).scrollLeft());
        }
    }

    $('#panel1').on('scroll', syncScroll);
    $('#panel2').on('scroll', syncScroll);
});
