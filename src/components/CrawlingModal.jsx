import React, { useState } from "react";
import { Button, Input, CheckGroup } from "@a12e/accessmonitor-ds";
import { Modal } from "./Modal";

const CrawlingModal = ({ 
    isOpen, 
    onRequestClose, 
    onSubmit, 
    theme, 
    selectedItems = [],
    itemType = "websites" // "websites" or "categories"
}) => {
    const [maxDepth, setMaxDepth] = useState(0);
    const [maxPages, setMaxPages] = useState(0);
    const [waitJS, setWaitJS] = useState(false);
    const [value, setValue] = useState("1");
    const handleClear = () => {
        setMaxDepth(0);
        setMaxPages(0);
        setWaitJS(false);
    };

    const handleSubmit = () => {
        onSubmit({
            maxDepth,
            maxPages,
            waitJS,
            selectedItems
        });
        handleClear();
    };

    const handleClose = () => {
        handleClear();
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            title="Procura automática de páginas"
        >
            <div className="d-flex flex-column gap-2">
                <div>
                    <Input
                        darkTheme={theme}
                        label="Profundidade máxima"
                        type="number"
                        value={maxDepth}
                        onChange={e => setMaxDepth(Number(e.target.value))}
                        min="0"
                    />
                    <small className="text-muted">
                        Escreva 0 para procurar páginas diretamente ligadas à página inicial (ou sub-domínio desejado)
                    </small>
                </div>
                
                <div>
                    <Input
                        label="Número máximo de páginas"
                        darkTheme={theme}
                        type="number"
                        value={maxPages}
                        onChange={e => setMaxPages(Number(e.target.value))}
                        min="0"
                    />
                    <small className="text-muted">
                        Escreva 0 para procurar todas as páginas
                    </small>
                </div>
                
                <div className="form-check">
                    <CheckGroup
                        darkTheme={theme}
                        data={[
                            {
                                id: '1',
                                name: "Esperar que o JavaScript carregue antes de começar o processo de crawling"
                            }
                            
                        ]}
                        inline  
                        onChange={(value) => setWaitJS(value.includes('1'))}
                        value={waitJS ? '1' : '0'}
                        name="waitJS"
                    />
                </div>
                
                <div className="d-flex justify-content-start gap-3 mt-3">
                    <Button
                        darkTheme={theme}
                        text="Limpar"
                        className="btn-danger"
                        onClick={handleClear}
                    />
                    <Button
                        darkTheme={theme}
                        text="Procurar"
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={selectedItems.length === 0}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default CrawlingModal; 