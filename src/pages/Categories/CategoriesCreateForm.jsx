import React, { useState, useEffect } from 'react';
import { Input, Button, Breadcrumb, MultiSelect } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';
import { extractNavigationContext } from '../../utils/navigation';
import debounce from 'lodash/debounce';

const CategoriesCreateForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, reset } = useForm({ mode: 'onChange' });
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    const [directories, setDirectories] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [directoriesOptions, setDirectoriesOptions] = useState([]);
    const [websitesOptions, setWebsitesOptions] = useState([]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const watchedName = watch("categoryName");
    const [websitesSearch, setWebsitesSearch] = useState("");
    const [defaultDirectories, setDefaultDirectories] = useState([]);
    const [defaultWebsites, setDefaultWebsites] = useState([]);
    const [isNameInvalid, setIsNameInvalid] = useState(false);
    // Example options, replace with API data if needed

    const websiteOptions = [
        { value: "1", label: "Sítio Web 1" },
        { value: "2", label: "Sítio Web 2" },
        { value: "3", label: "Sítio Web 3" },
        { value: "4", label: "Sítio Web 4" },
    ];

    // Dynamic breadcrumbs based on navigation context
    const previousPath = localStorage.getItem('previousPath') || '';
    const navContext = extractNavigationContext(previousPath);
    
    let breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/categories">Categorias</Link> },
        { title: id ? t('CATEGORIES_PAGE.EDIT.title') : t('CATEGORIES_PAGE.ADD.title') },
    ];

    // If editing from a specific category view
    if (id && navContext && navContext.type === 'category') {
        const { categoryName } = navContext.data;
        breadcrumbs = [
            { children: <Link to="/dashboard/home">Início</Link> },
            { children: <Link to="/dashboard/categories">Categorias</Link> },
            { children: <Link to={`/dashboard/categories/view/${encodeURIComponent(categoryName)}`}>{categoryName}</Link> },
            { title: t('CATEGORIES_PAGE.EDIT.title') },
        ];
    }


    useEffect(() => {
        const fetchDirectories = async () => {
            const response = await api.get('/directory/all');
            setDirectoriesOptions(response.data.result.map(item => ({
                value: item.DirectoryId,
                label: item.Name
            })));
        };
        fetchDirectories();
        const fetchCategory = async () => {
            // Fetch category by id and set form values
            const response = await api.get(`/tag/info/${id}`);
            const cat = response.data.result;
            setValue("categoryName", cat.Name);
            setDirectories(cat.directories.map(dir => dir.DirectoryId));
            setWebsites(cat.websites.map(web => web.WebsiteId));
            setDefaultDirectories(cat.directories.map(dir => dir.DirectoryId));
            setWebsitesOptions(cat.websites.map(web => ({
                value: web.WebsiteId,
                label: web.Name
            })));
            setDefaultWebsites(cat.websites.map(web => ({
                value: web.WebsiteId,
                label: web.Name
            })));
           // fetchWebsites(cat.websites[0].Name.);

        };
        fetchCategory();
    }, [id, reset]);


    // Função para buscar websites conforme pesquisa
    const fetchWebsites = async (searchTerm) => {
        const responseWebsites = await api.get(`/website/all/100/0/sort=/direction=/search=${searchTerm}`);
        setWebsitesOptions([
            ...defaultWebsites.map(web => ({
                value: web.value,
                label: web.label
            })),
            ...responseWebsites.data.result.map(item => ({
            value: item.WebsiteId,
            label: item.Name
        }))]);
    };

    // Debounced handler para pesquisa
    const debouncedFetchWebsites = debounce((value) => {
        fetchWebsites(value);
    }, 400);

    const handleWebsitesSearch = (value) => {
        setWebsitesSearch(value);
        debouncedFetchWebsites(value);
    };

    const handleDirectoriesChange = (newDirs) => {
        setDirectories(newDirs || []);
        setValue("directories", newDirs || []);
        trigger("directories");
    };
    const handleWebsitesChange = (newWebs) => {
        setWebsites(newWebs || []);
        setValue("websites", newWebs || []);
        trigger("websites");
    };

    const handleValidateNameAndShortName = async (data) => {
        const response = await api.get(`/tag/exists/${data}`);
        setIsNameInvalid(response.data.result);
    }

    const onSubmit = async (data) => {
        if (!data.categoryName || data.categoryName.length < 3) {
            setFeedbackMessage("O nome da categoria deve ter pelo menos 3 caracteres");
            setShowFeedbackModal(true);
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                name: data.categoryName,
                directories: directories,
                websites: websites
            };
            let response;
            if (id) {
                payload.defaultDirectories = defaultDirectories;
                payload.defaultWebsites = defaultWebsites.map(web => web.value);
                payload.tagId = id;
                response = await api.post(`/tag/update`, payload);
            } else {
                response = await api.post('/tag/create', payload);
            }
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage(id ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!");
                reset();
                setDirectories([]);
                setWebsites([]);
            } else {
                setFeedbackMessage("Erro ao salvar categoria. Tente novamente.");
            }
        } catch (error) {
            setFeedbackMessage("Erro ao salvar categoria. Tente novamente.");
        } finally {
            setIsSubmitting(false);
            setShowFeedbackModal(true);
        }
    };

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{t('CATEGORIES_PAGE.ADD.title')}</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <p>{t('CATEGORIES_PAGE.ADD.description_category')}</p>
                <p>{t('CATEGORIES_PAGE.ADD.note')}</p>
                <div className='w-50 d-flex flex-column gap-4'>
                    <h2>{id ? "Editar Categoria" : "Nova Categoria"}</h2>
                    <Input
                        id="categoryName"
                        label={t('CATEGORIES_PAGE.ADD.name_label')}
                        name="categoryName"
                        type="text"
                        darkTheme={theme}
                        placeholder="Nome da categoria"
                        {...register("categoryName", {
                            required: "Campo obrigatório",
                            minLength: { value: 3, message: "Nome deve ter pelo menos 3 caracteres" },
                            maxLength: { value: 100, message: "Nome não pode exceder 100 caracteres" }
                        })}
                        onChange={e => {
                            setValue("categoryName", e.target.value);
                            handleValidateNameAndShortName(e.target.value);
                        }}
                        value={watchedName}    error={errors.categoryName?.message || isNameInvalid ? "O nome da categoria já existe" : ""}
                    />

                    <MultiSelect
                        id="directories"
                        darkTheme={theme}
                        label={t('CATEGORIES_PAGE.ADD.directories_label') + ` ${t('HEADER.optional')}`}
                        name="directories"
                        value={directories || []}
                        onChange={handleDirectoriesChange}
                        options={directoriesOptions}
                        placeholder="Selecione diretórios (opcional)"
                        isValid={true}
                    />

                    <MultiSelect
                        id="websites"
                        darkTheme={theme}
                        label={`${t('CATEGORIES_PAGE.ADD.websites_label')} ${t('HEADER.optional')}`}
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
                            disabled={isSubmitting || !watchedName || watchedName.length < 3 || isNameInvalid}
                        />
                        <Button
                            type="button"
                            className="ms-3"
                            darkTheme={theme}
                            text="Sair"
                            variant="danger"
                            onClick={() => navigate('/dashboard/categories')}
                        />
                    </div>
                </div>
            </form>
            <Modal
                isOpen={showFeedbackModal}
                onRequestClose={() => setShowFeedbackModal(false)}
                title={id ? "Editar Categoria" : "Criar Categoria"}
            >
                <p>{feedbackMessage}</p>
                <Button
                    darkTheme={theme}
                    text="OK"
                    className="btn-primary"
                    onClick={() => {
                        setShowFeedbackModal(false);
                        if (feedbackMessage === (id ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!")) {
                            navigate('/dashboard/categories');
                        }
                    }}
                />
            </Modal>
        </div>
    );
}
export default CategoriesCreateForm;