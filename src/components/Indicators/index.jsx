import './style.indicators.css';

export default function Indicators({
   listItems
}) {
    return (
        <div id="indicators" >
            <ul className="parent-list">
                {
                    listItems.map((item, index) => (
                        <li key={index} className="parent-item">
                            <span className={`parent-item-title ${item.itemsList ? 'parent-item-title' : ''}`}>{item.title}: {item.value}</span>
                            {item.itemsList && <ul className="inner-list">
                                {item.itemsList.map((item, index) => (
                                    <li key={index}>{item.title}: {item.value}</li>
                                ))}
                            </ul>}
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}