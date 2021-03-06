


function dataToCsvFile(dataRows, localcrmid) {
    
    let csvContent = "" 
        + dataRows.map(e => e.join(",")).join("\n");

    const csvFile = new File(
        [csvContent], 
        `ddex-${localcrmid}.csv`, 
        { type: 'text/csv;charset=utf-8;' })

    return csvFile
}

export default dataToCsvFile