import React, { useState, useEffect } from 'react';
import { Input, Button, CheckGroup, RadioGroup, Breadcrumb, MultiSelect } from "@a12e/accessmonitor-ds";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';
import { extractNavigationContext } from '../../utils/navigation';

const DirectoriesCreateForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, reset } = useForm({
        mode: 'onChange'
    });
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showInObservatory, setShowInObservatory] = useState('yes');
    const [format, setFormat] = useState('1');
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    // Watch form values for validation
    const watchedName = watch("name");
    const [defaultTags, setDefaultTags] = useState([]);
    const [isNameInvalid, setIsNameInvalid] = useState(false);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/tag/all');
                setCategories(response.data.result.map(item => ({
                    value: item.TagId,
                    label: item.Name
                })));
            } catch (error) {
                console.error('Error fetching categories:', error);
                setFeedbackMessage("Erro ao carregar categorias. Tente novamente.");
                setShowFeedbackModal(true);
            }
        }
        const fetchDirectory = async () => {
            const response = await api.get(`/directory/info/${id}`);
            const dir = response.data.result;
            setValue("name", dir.Name);
            setShowInObservatory(dir.Show_in_Observatory === 1 ? 'yes' : 'no');
            setFormat(dir.Method ? String(dir.Method) : '1');
            setTags(dir.tags.map(tag => tag.TagId));
            setDefaultTags(dir.tags.map(tag => tag.TagId));
            trigger("tags");
        }
        fetchCategories();
        fetchDirectory();
    }, [id, reset]);

    // Dynamic breadcrumbs based on navigation context
    const previousPath = localStorage.getItem('previousPath') || '';
    const navContext = extractNavigationContext(previousPath);
    
    let breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/directories">Diretórios</Link> },
        {
            title: id ? t('DIRECTORIES_PAGE.EDIT.title') : t('DIRECTORIES_PAGE.ADD.title'),
        }
    ];

    // If editing from a specific directory view
    if (id && navContext && navContext.type === 'directory') {
        breadcrumbs = [
            { children: <Link to="/dashboard/home">Início</Link> },
            { children: <Link to="/dashboard/directories">Diretórios</Link> },
            { children: <Link to={`/dashboard/directories/view/${id}`}>{watch("name")}</Link> },
            {
                title: "Editar Diretório",
            }
        ];
    }

    // Validation function for entities
    const validateEntities = () => {
        if (tags.length === 0) {
            return "Pelo menos uma categoria deve ser selecionada";
        }
        return true;
    };

    // Handle radio button changes
    const handleShowInObservatoryChange = (value) => {
        setShowInObservatory(value);
        setValue("show_in_observatory", value);
    };

    const handleFormatChange = (value) => {
        setFormat(value);
        setValue("format", value);
    };

    // Handle entities change with validation
    const handleEntitiesChange = (newEntities) => {
        console.log('New entities:', newEntities);
        setTags(newEntities || []);
        setValue("tags", newEntities || []);
        trigger("tags");
    };

    const handleValidateName = async (data) => {
        const response = await api.get(`/directory/exists/${data}`);
        setIsNameInvalid(response.data.result);
    }

    const onSubmit = async (data) => {
        console.log('Form data:', data);
        console.log('Tags:', tags);
        // Validate entities before submission
        const entitiesValidation = validateEntities();
        if (entitiesValidation !== true) {
            setFeedbackMessage(entitiesValidation);
            setShowFeedbackModal(true);
            return;
        }

        // Validate name length
        if (data.name && data.name.length < 3) {
            setFeedbackMessage("O nome do diretório deve ter pelo menos 3 caracteres");
            setShowFeedbackModal(true);
            return;
        }

        if (data.name && data.name.length > 100) {
            setFeedbackMessage("O nome do diretório não pode exceder 100 caracteres");
            setShowFeedbackModal(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = {
                name: data.name,
                observatory: showInObservatory === 'yes' ? 1 : 0,
                method: format === '1' ? 1 : 0,
                tags: tags

            };
            let response;
            if (id) {
                formData.directoryId = Number(id);
                formData.defaultTags = defaultTags;
                response = await api.post(`/directory/update`, formData);
            } else {
                response = await api.post('/directory/create', formData);
            }
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage(id ? "Diretório atualizado com sucesso!" : "Diretório criado com sucesso!");
                setValue("name", "");
                setShowInObservatory('yes');
                setFormat('1');
                setTags([]);
                navigate('/dashboard/directories');
            } else {
                setFeedbackMessage("Erro ao salvar diretório. Tente novamente.");
            }
        } catch (error) {
            console.error('Error saving directory:', error);
            if (error.response?.status === 409) {
                setFeedbackMessage("Já existe um diretório com este nome. Escolha outro nome.");
            } else if (error.response?.status === 400) {
                setFeedbackMessage("Dados inválidos. Verifique as informações inseridas.");
            } else {
                setFeedbackMessage("Erro ao salvar diretório. Tente novamente.");
            }
        } finally {
            setIsSubmitting(false);
            setShowFeedbackModal(true);
        }
    };

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />

            <h1>{id ? "Editar Diretório" : "Criar Diretório"}</h1>
           
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                 <p>Um Diretório é um agregador de sítios web. Os Diretórios têm por objetivo publicar sítios web publicamente no Observatório. Os Diretórios são construídos com base nas Categorias/tags que se encontram agarradas aos sítios web.</p>
            <p>Os Diretórios podem ser construídos:</p>
            <ul>
                <li>por interseção das Categorias. A interseção é uma operação entre conjuntos que resulta em um novo conjunto formado por todos os elementos que são comuns a dois ou mais conjuntos originais.</li>
                <li>por reunião das Categorias. A reunião, ou união, de conjuntos refere-se à combinação de todos os elementos de dois ou mais conjuntos.</li>
            </ul>
                <div className='w-50 d-flex flex-column gap-3'>
                    <Input
                        label={t('DIRECTORIES_PAGE.ADD.name_label')}
                        name="name"
                        darkTheme={theme}
                        value={watchedName}
                        placeholder="Nome do diretório"
                        type="text"
                        {...register("name", { 
                            required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
                            minLength: {
                                value: 3,
                                message: "Nome deve ter pelo menos 3 caracteres"
                            },
                            maxLength: {
                                value: 100,
                                message: "Nome não pode exceder 100 caracteres"
                            }
                        })}
                            onChange={(e) => {
                            setValue("name", e.target.value);
                            handleValidateName(e.target.value);
                        }}
                        error={errors.name?.message || isNameInvalid ? "O nome do diretório já existe" : ""}
                    />

                    <fieldset>
                        <legend>{t('DIRECTORIES_PAGE.ADD.show_in_observatory')} *</legend>
                        <RadioGroup
                            darkTheme={theme}
                            data={[
                                {
                                    id: 'yes',
                                    name: "Sim"
                                },
                                {
                                    id: 'no',
                                    name: "Não"
                                }
                            ]}
                            inline
                            onChange={handleShowInObservatoryChange}
                            value={showInObservatory}
                            name="show_in_observatory"
                        />
                        {errors.show_in_observatory && (
                            <div className="text-danger mt-1">{errors.show_in_observatory.message}</div>
                        )}
                    </fieldset>

                    <fieldset>
                        <legend>{t('DIRECTORIES_PAGE.ADD.choose_format')} *</legend>
                        <RadioGroup
                            darkTheme={theme}
                            data={[
                                {
                                    id: '1',
                                    name: t('DIRECTORIES_PAGE.ADD.intersection')
                                },
                                {
                                    id: '2',
                                    name: t('DIRECTORIES_PAGE.ADD.union')
                                }
                            ]}
                            inline
                            onChange={handleFormatChange}
                            value={format}
                            name="format"
                        />
                        {errors.format && (
                            <div className="text-danger mt-1">{errors.format.message}</div>
                        )}
                    </fieldset>

                    <div>
                        <label>{t('DIRECTORIES_PAGE.ADD.select_categories')} *</label>
                        <MultiSelect
                            id="entities"
                            darkTheme={theme}
                            name="tags"
                            value={tags || []}
                            onChange={handleEntitiesChange}
                            options={categories}
                            placeholder="Selecione pelo menos uma categoria"
                        />
                        {(tags || []).length === 0 && (
                            <div className="text-danger mt-1">Pelo menos uma categoria deve ser selecionada</div>
                        )}
                    </div>

                    <div className="d-flex justify-content-start">
                        <Button
                            type="submit"
                            darkTheme={theme}
                            text={isSubmitting ? (id ? "A atualizar..." : "A guardar...") : (id ? "Atualizar e Sair" : t('ADMIN_CONSOLE.save_and_exit'))}
                            disabled={isSubmitting || !watchedName || (tags || []).length === 0 || isNameInvalid}
                        />
                        <Button
                            type="button"
                            className="ms-3"
                            darkTheme={theme}
                            text="Sair"
                            variant="danger"
                            onClick={() => navigate('/dashboard/directories')}
                        />
                    </div>
                </div>
            </form>

            <Modal
                isOpen={showFeedbackModal}
                onRequestClose={() => setShowFeedbackModal(false)}
                title={id ? "Editar Diretório" : "Criar Diretório"}
            >
                <p>{feedbackMessage}</p>
                <Button
                    darkTheme={theme}
                    text="OK"
                    className="btn-primary"
                    onClick={() => {
                        setShowFeedbackModal(false);
                        if (feedbackMessage === (id ? "Diretório atualizado com sucesso!" : "Diretório criado com sucesso!")) {
                            navigate('/dashboard/directories');
                        }
                    }}
                />
            </Modal>
        </div>
    );
}

export default DirectoriesCreateForm;