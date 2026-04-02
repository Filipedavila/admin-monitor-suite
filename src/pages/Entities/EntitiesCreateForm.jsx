import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Breadcrumb, MultiSelect } from "@a12e/accessmonitor-ds";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';
import { extractNavigationContext } from '../../utils/navigation';
import debounce from 'lodash/debounce';

const EntitiesCreateForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, reset } = useForm({ mode: 'onChange' });
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    const [websites, setWebsites] = useState([]);
    const [websitesOptions, setWebsitesOptions] = useState([]);
    const [websitesSearch, setWebsitesSearch] = useState("");
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const watchedEntityName = watch("entityName");
    const watchedFullName = watch("fullName");
    const [defaultWebsites, setDefaultWebsites] = useState([]);
    const [shortNameInvalid, setShortNameInvalid] = useState(false);
    const websitesValueRef = useRef([]);
    const [fullNameInvalid, setFullNameInvalid] = useState(false);
    // Load initial websites
    useEffect(() => {
        const fetchEntity = async () => {
            const response = await api.get(`/entity/info/${id}`);
            const ent = response.data.result;
            setValue("entityName", ent.Short_Name);
            setValue("fullName", ent.Long_Name);
            
            const websiteIds = ent.websites.map(web => web.WebsiteId);
            const selectedWebsiteOptions = ent.websites.map(web => ({
                value: web.WebsiteId,
                label: web.Name
            }));
            
            websitesValueRef.current = websiteIds;
            setWebsitesOptions(selectedWebsiteOptions);
            setWebsites(websiteIds);
            setValue("websites", websiteIds);
            setDefaultWebsites(websiteIds);
            
            fetchWebsites("");
        };
        
        if (id) {
            fetchEntity();
        } else {
            fetchWebsites("");
        }
    }, [id, reset]);

    // Function to fetch websites based on search
    const fetchWebsites = async (searchTerm) => {
        try {
            const response = await api.get(`/website/all/10000/0/sort=/direction=/search=${searchTerm}`);
            const fetchedOptions = response.data.result.map(item => ({
                value: item.WebsiteId,
                label: item.Name
            }));
            
            setWebsitesOptions(prevOptions => {
                const currentValues = websitesValueRef.current;
                const preservedOptions = prevOptions.filter(opt => currentValues.includes(opt.value));
                const allOptions = [...preservedOptions];
                const existingIds = new Set(allOptions.map(opt => opt.value));
                fetchedOptions.forEach(opt => {
                    if (!existingIds.has(opt.value)) {
                        allOptions.push(opt);
                    }
                });
                return allOptions;
            });
        } catch (error) {
            console.error('Error fetching websites:', error);
        }
    };

    // Debounced handler for search
    const debouncedFetchWebsites = debounce((value) => {
        fetchWebsites(value);
    }, 400);

    const handleWebsitesSearch = (value) => {
        setWebsitesSearch(value);
        debouncedFetchWebsites(value);
    };

    const handleWebsitesChange = (newWebsites) => {
        setWebsites(newWebsites || []);
        websitesValueRef.current = newWebsites || [];
        setValue("websites", newWebsites || []);
        trigger("websites");
    };

    // Dynamic breadcrumbs based on navigation context
    const previousPath = localStorage.getItem('previousPath') || '';
    const navContext = extractNavigationContext(previousPath);
    
    let breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/entities">Entidades</Link> },
        { title: id ? "Editar Entidade" : "Criar Entidade" },
    ];

    // If editing from a specific entity view
    if (id && navContext && navContext.type === 'entity') {
        breadcrumbs = [
            { children: <Link to="/dashboard/home">Início</Link> },
            { children: <Link to="/dashboard/entities">Entidades</Link> },
            { children: <Link to={`/dashboard/entities/view/${id}`}>{watch("entityName")}</Link> },
            { title: "Editar Entidade" },
        ];
    }

    const onSubmit = async (data) => {
        // Validate entity name
        if (!data.entityName || data.entityName.length < 2) {
            setFeedbackMessage("O nome da entidade deve ter pelo menos 2 caracteres");
            setShowFeedbackModal(true);
            return;
        }

        if (data.entityName && data.entityName.length > 50) {
            setFeedbackMessage("O nome da entidade não pode exceder 50 caracteres");
            setShowFeedbackModal(true);
            return;
        }

        // Validate full name if provided
        if (data.fullName && data.fullName.length > 200) {
            setFeedbackMessage("O nome completo não pode exceder 200 caracteres");
            setShowFeedbackModal(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                
                shortName: data.entityName,
                longName: data.fullName || null,
                websites: websites
            };
            let response;
            if (id) {
                payload.defaultWebsites = defaultWebsites;
                payload.entityId = id;
                response = await api.post(`/entity/update`, payload);
            } else {
                response = await api.post('/entity/create', payload);
            }
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage(id ? "Entidade atualizada com sucesso!" : "Entidade criada com sucesso!");
                reset();
                setWebsites([]);
                setWebsitesSearch("");
            } else {
                setFeedbackMessage("Erro ao salvar entidade. Tente novamente.");
            }
        } catch (error) {
            console.error('Error saving entity:', error);
            setFeedbackMessage("Erro ao salvar entidade. Tente novamente.");
        } finally {
            setIsSubmitting(false);
            setShowFeedbackModal(true);
        }
    };
    const handleValidateNameAndShortName = async (data) => {
        const response = await api.get(`/entity/exists/shortName/${data}`);
        setShortNameInvalid(response.data.result);
    }

    const handleValidateFullName = async (data) => {
        const response = await api.get(`/entity/exists/longName/${data}`);
        setFullNameInvalid(response.data.result);
    }

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{t('ENTITIES_PAGE.ADD.title')}</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <p>{t('ENTITIES_PAGE.ADD.description_entity')}</p>
                <div className='w-50 d-flex flex-column gap-3'>
                    <h2>{id ? "Editar Entidade" : "Nova Entidade"}</h2>
                    
                    <Input
                        id="entityName"
                        label={t('ENTITIES_PAGE.ADD.short_name_label')}
                        name="entityName"
                        type="text"
                        darkTheme={theme}
                        placeholder="Nome da entidade"
                        {...register("entityName", {
                            required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
                            minLength: {
                                value: 2,
                                message: "Nome deve ter pelo menos 2 caracteres"
                            },
                            maxLength: {
                                value: 50,
                                message: "Nome não pode exceder 50 caracteres"
                            }
                        })}
                        value={watchedEntityName}
                        onChange={e => {
                            setValue("entityName", e.target.value);
                            handleValidateNameAndShortName(e.target.value);
                        }}
                        error={errors.entityName?.message || shortNameInvalid ? "O nome da entidade já existe" : ""}
                    />

                    <Input
                        id="fullName"
                        label={t('ENTITIES_PAGE.ADD.long_name_label') + ` ${t('HEADER.optional')}`}
                        name="fullName"
                        type="text"
                        darkTheme={theme}
                        placeholder="Nome completo da entidade (opcional)"
                        {...register("fullName", {
                            maxLength: {
                                value: 200,
                                message: "Nome completo não pode exceder 200 caracteres"
                            },
                            pattern: {
                                value: /^[a-zA-ZÀ-ÿ0-9\s\-_.,()]+$/,
                                message: "Nome completo contém caracteres inválidos"
                            }
                        })}
                            onChange={e => {
                            setValue("fullName", e.target.value);
                            handleValidateFullName(e.target.value);
                        }}
                        value={watchedFullName}
                        error={errors.fullName?.message || fullNameInvalid ? "O nome completo da entidade já existe" : ""}
                    />



                    <MultiSelect
                        id="websites"
                        darkTheme={theme}
                        label={t('CATEGORIES_PAGE.ADD.websites_label') + ` ${t('HEADER.optional')}`}
                        name="websites"
                        value={websites || []}
                        onChange={handleWebsitesChange}
                        onInputChange={handleWebsitesSearch}
                        options={websitesOptions || []}
                        placeholder="Selecione websites (opcional)"
                        isValid={true}
                    />

                    <div className="d-flex justify-content-start">
                        <Button
                            darkTheme={theme}
                            type="submit"
                            text={isSubmitting ? (id ? "A atualizar..." : "A guardar...") : (id ? "Atualizar e Sair" : t('ADMIN_CONSOLE.save_and_exit'))}
                            disabled={isSubmitting || !watchedEntityName || watchedEntityName.length < 2 || shortNameInvalid || fullNameInvalid}
                        />
                        <Button
                            type="button"
                            className="ms-3"
                            darkTheme={theme}
                            text="Sair"
                            variant="danger"
                            onClick={() => navigate('/dashboard/entities')}
                        />
                    </div>
                </div>
            </form>

            <Modal
                isOpen={showFeedbackModal}
                onRequestClose={() => setShowFeedbackModal(false)}
                title={id ? "Editar Entidade" : "Criar Entidade"}
            >
                <p>{feedbackMessage}</p>
                <Button
                    darkTheme={theme}
                    text="OK"
                    className="btn-primary"
                    onClick={() => {
                        setShowFeedbackModal(false);
                        if (feedbackMessage === (id ? "Entidade atualizada com sucesso!" : "Entidade criada com sucesso!")) {
                            navigate('/dashboard/entities');
                        }
                    }}
                />
            </Modal>
        </div>
    );
}

export default EntitiesCreateForm;