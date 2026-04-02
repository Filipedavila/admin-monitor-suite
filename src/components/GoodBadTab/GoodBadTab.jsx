import React, { useState, useEffect } from 'react'
import { Tabs } from "@a12e/accessmonitor-ds";
import { 
  dataHeaders, 
  dataRows, 
  columnsOptions,
  nameOfIcons, 
  paginationButtonsTexts 
} from "./table.config.jsx";
import { SortingTable } from "@a12e/accessmonitor-ds";
import { useTheme } from '../../context/ThemeContext';

export default function GoodBadTab() {
    const { theme } = useTheme();
    const [dataGood, setDataGood] = useState(dataRows)
    const [dataBad, setDataBad] = useState(dataRows)
    const [checkboxesSelected, setCheckboxesSelected] = useState([])

    useEffect(() => {
        // Initialize data if needed
    }, [])

    const tabs = [
        {
            eventKey: "tab1",
            title: "Boas Práticas",
            component:
                <SortingTable
                    darkTheme={theme}
                    headers={dataHeaders}
                    setDataList={setDataGood}
                    dataList={dataGood}
                    columnsOptions={columnsOptions}
                    nextPage={() => null}
                    caption="Boas Práticas"
                    iconsAltTexts={nameOfIcons}
                    paginationButtonsTexts={paginationButtonsTexts}
                    project={""}
                    setCheckboxesSelected={setCheckboxesSelected}
                />
        },
        {
            eventKey: "tab2",
            title: "Más Práticas",
            component:
                <SortingTable
                    darkTheme={theme}
                    headers={dataHeaders}
                    setDataList={setDataBad}
                    dataList={dataBad}
                    columnsOptions={columnsOptions}
                    nextPage={() => null}
                    caption="Más Práticas"
                    iconsAltTexts={nameOfIcons}
                    paginationButtonsTexts={paginationButtonsTexts}
                    project={""}
                    setCheckboxesSelected={setCheckboxesSelected}
                />
        }
    ]
    return (
        <>
            <Tabs tabs={tabs} defaultActiveKey={"tab1"}/>
        </>
    )
}