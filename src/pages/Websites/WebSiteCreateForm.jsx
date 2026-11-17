import { useState, useEffect, useRef, useCallback } from "react";
import qs from "qs";
import { Input, Button, Tabs, Breadcrumb } from "@a12e/accessmonitor-ds";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import AcessibilityDeclaration from "./Tabs/acessiblityDeclaration";
import UsuabilitySeal from "./Tabs/usuabilitySeal";
import Associations from "./Tabs/associations";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';
import {
  getUpdateWebsiteUrlErrorKey,
  getWebsiteUrlErrorKey,
  isSameWebsiteUrl,
  normalizeWebsiteUrl,
  updateWebsiteUrl,
} from '../../services/websites';
import {
  buildWebsiteOriginState,
  getWebsiteOriginFromState,
  getWebsiteOriginTrail,
} from '../../utils/navigation';

const WebSiteCreateForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [activeTab, setActiveTab] = useState("tab1");
  const { id } = useParams();
  useEffect(() => {
  }, [errors]);

  // Regista esta página no histórico usado pelos outros ecrãs (currentPath/previousPath).
  // Sem isto, a página seguinte herdava como "anterior" a página vista antes da edição.
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);
  // State for options and loading
  const [institutionOptions, setInstitutionOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // State for selected values
  const [institutionValue, setInstitutionValue] = useState("");
  // Categories currently associated with the website, as {value, label}
  const [categoryValue, setCategoryValue] = useState([]);

  // Tags currently saved on the website (used to diff add/remove on submit)
  const originalCategoryIdsRef = useRef([]);

  // URL carregado do servidor: o PATCH /websites/:id/url só é feito se o URL mudar.
  const originalUrlRef = useRef("");

  const categorySearchTimeoutRef = useRef(null);
  // State for Select values to track conditional validation
  const [complianceValue, setComplianceValue] = useState("");
  const [typeSealValue, setTypeSealValue] = useState("");

  // State for real-time validation messages
  const [nameValidation, setNameValidation] = useState({ isValid: null, message: "" });
  const [urlValidation, setUrlValidation] = useState({ isValid: null, message: "" });
  const [declarationDateValidation, setDeclarationDateValidation] = useState({ isValid: null, message: "" });
  const [sealDateValidation, setSealDateValidation] = useState({ isValid: null, message: "" });

  // Validation state for the categories MultiSelect
  const [categoryValidation, setCategoryValidation] = useState({ isValid: null, message: "" });

  // Validation state for Selects
  const [complianceValidation, setComplianceValidation] = useState({ isValid: null, message: "" });
  const [typeSealValidation, setTypeSealValidation] = useState({ isValid: null, message: "" });

  const validateCategories = (selected) => {
    // Categories are optional, but if selected, validate count
    if (selected && selected.length > 10) {
      setCategoryValidation({ isValid: false, message: "Máximo de 10 categorias permitidas." });
      return false;
    }
    if (selected && selected.length > 0) {
      setCategoryValidation({ isValid: true, message: "Categorias válidas selecionadas." });
    } else {
      setCategoryValidation({ isValid: null, message: "" });
    }
    return true;
  };

  // Validation functions for Selects
  const validateCompliance = (value) => {
    // Compliance is optional - no validation needed if empty
    if (!value) {
      setComplianceValidation({ isValid: null, message: "" });
      return true;
    }
    setComplianceValidation({ isValid: true, message: "Conformidade válida selecionada." });
    return true;
  };

  const validateTypeSeal = (value) => {
    // Type seal is optional - no validation needed if empty
    if (!value) {
      setTypeSealValidation({ isValid: null, message: "" });
      return true;
    }
    setTypeSealValidation({ isValid: true, message: "Tipo de selo válido selecionado." });
    return true;
  };

  // Real-time validation functions for required fields
  const validateNameField = (value) => {
    if (!value || value.trim() === "") {
      setNameValidation({ isValid: false, message: "Nome é obrigatório." });
      return false;
    }
    setNameValidation({ isValid: true, message: "" });
    return true;
  };

  const validateUrlField = (value) => {
    const urlErrorKey = getWebsiteUrlErrorKey(value);
    if (urlErrorKey) {
      setUrlValidation({ isValid: false, message: t(urlErrorKey) });
      return false;
    }
    setUrlValidation({ isValid: true, message: "" });
    return true;
  };

  // Conditional validation for dates with real-time updates
  const validateDeclarationDateField = (dateValue, complianceValue) => {
    // If compliance is selected, date is required
    if (complianceValue) {
      if (!dateValue || dateValue.trim() === "") {
        setDeclarationDateValidation({ isValid: false, message: "Data de declaração é obrigatória quando conformidade é selecionada." });
        return { isValid: false, message: "Data de declaração é obrigatória quando conformidade é selecionada." };
      }
      setDeclarationDateValidation({ isValid: true, message: "" });
      return { isValid: true, message: "" };
    }
    // If compliance is not selected, date is optional
    setDeclarationDateValidation({ isValid: null, message: "" });
    return { isValid: null, message: "" };
  };

  const validateSealDateField = (dateValue, typeSealValue) => {
    // If type seal is selected, date is required
    if (typeSealValue) {
      if (!dateValue || dateValue.trim() === "") {
        setSealDateValidation({ isValid: false, message: "Data de selo é obrigatória quando tipo de selo é selecionado." });
        return { isValid: false, message: "Data de selo é obrigatória quando tipo de selo é selecionado." };
      }
      setSealDateValidation({ isValid: true, message: "" });
      return { isValid: true, message: "" };
    }
    // If type seal is not selected, date is optional
    setSealDateValidation({ isValid: null, message: "" });
    return { isValid: null, message: "" };
  };

  // Legacy functions for submit validation (keep for backward compatibility)
  const validateDeclarationDate = (dateValue, complianceValue) => {
    return validateDeclarationDateField(dateValue, complianceValue);
  };

  const validateSealDate = (dateValue, typeSealValue) => {
    return validateSealDateField(dateValue, typeSealValue);
  };

  const fetchInstitutions = useCallback(async () => {
    try {
      const queryObj = { pagination: { limit: 100, page: 1 } };
      const response = await api.get(`/institutions/?${qs.stringify(queryObj)}`);
      const fetched = (response.data.data || []).map(inst => ({
        value: inst.id,
        label: `${inst.longName} - ${inst.shortName}`,
      }));
      setInstitutionOptions(fetched);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  }, []);

  const fetchCategories = useCallback(async (search) => {
    setIsCategoryLoading(true);
    try {
      const queryObj = { pagination: { limit: 20, page: 1 } };
      if (search) queryObj.filters = { searchTerm: search };
      const response = await api.get(`/tags?${qs.stringify(queryObj)}`);
      const fetched = (response.data.data || []).map(c => ({
        value: c.id,
        label: c.name,
      }));
      setCategoryOptions(fetched);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstitutions();
    if (!id) {
      fetchCategories("");
    }
  }, [id, fetchInstitutions, fetchCategories]);

  // Load website data for editing
  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const response = await api.get(`/websites/${id}`);
        const w = response.data.data;

        setValue("name", w.title || "");
        originalUrlRef.current = w.baseUrl || "";
        setValue("initial_url", w.baseUrl || "");
        setInstitutionValue(w.institutionId != null ? String(w.institutionId) : "");

        let declarationLevel = "";
        let declarationDate = "";
        try {
          const declarationResponse = await api.get(`/websites/${id}/declaration`);
          const declaration = declarationResponse.data?.data ?? declarationResponse.data;
          if (declaration?.declaration) declarationLevel = declaration.declaration;
          if (declaration?.updatedAt || declaration?.createdAt) {
            declarationDate = declaration.updatedAt || declaration.createdAt;
          }
        } catch (declarationError) {
          console.error('Error fetching website declaration:', declarationError);
        }
        setValue("compliance", declarationLevel);
        setComplianceValue(declarationLevel);
        setValue("accessibility_declaration_date", declarationDate);

        let stampLevel = "";
        let stampDate = "";
        try {
          const stampResponse = await api.get(`/websites/${id}/stamp`);
          const stamp = stampResponse.data?.data ?? stampResponse.data;
          if (stamp?.stamp) stampLevel = stamp.stamp;
          if (stamp?.updatedAt || stamp?.createdAt) {
            stampDate = stamp.updatedAt || stamp.createdAt;
          }
        } catch (stampError) {
          console.error('Error fetching website stamp:', stampError);
        }
        setValue("type_seal", stampLevel);
        setTypeSealValue(stampLevel);
        setValue("usability_seal_date", stampDate);

        let categorySelected = [];
        try {
          const tagsResponse = await api.get(`/websites/${id}/tags`);
          const tags = tagsResponse.data.data || tagsResponse.data.result || [];
          categorySelected = tags.map(tag => ({ value: tag.id, label: tag.name }));
        } catch (tagsError) {
          console.error('Error fetching website tags:', tagsError);
        }

        originalCategoryIdsRef.current = categorySelected.map(c => c.value);
        setCategoryValue(categorySelected);

        await fetchCategories("");

        setNameValidation({ isValid: true, message: "" });
        setUrlValidation({ isValid: true, message: "" });
      } catch (error) {
        console.error("Error fetching website data:", error);
        setFeedbackMessage("Erro ao carregar dados do sítio web.");
        setShowFeedbackModal(true);
      }
    };

    if (id) {
      fetchWebsiteData();
    }
  }, [id, setValue]);

  // Initialize validation for required fields
  useEffect(() => {
    validateNameField("");
    validateUrlField("");
  }, []);

  // Handlers for the categories MultiSelect search with debounce
  const handleCategorySearch = (value) => {
    if (categorySearchTimeoutRef.current) clearTimeout(categorySearchTimeoutRef.current);
    categorySearchTimeoutRef.current = setTimeout(() => fetchCategories(value || ""), 300);
  };

  const handleInstitutionChange = (value) => {
    setValue("institution", value);
    setInstitutionValue(value);
  };

  const handleCategoryChange = (selected) => {
    const validatedSelection = selected || [];
    setValue("categories", validatedSelection.map((item) => item.value));
    setCategoryValue(validatedSelection);
    const isValid = validateCategories(validatedSelection);
    if (!isValid) {
      setActiveTab("tab3");
    }
  };

  // Handlers for Select change with validation
  const handleComplianceChange = (value) => {
    setValue("compliance", value);
    setComplianceValue(value);
    validateCompliance(value);

    // Re-validate declaration date when compliance changes
    const currentDeclarationDate = document.getElementById("accessibility_declaration_date")?.value || "";
    validateDeclarationDateField(currentDeclarationDate, value);
  };

  const handleTypeSealChange = (value) => {
    setValue("type_seal", value);
    setTypeSealValue(value);
    validateTypeSeal(value);

    // Re-validate seal date when type seal changes
    const currentSealDate = document.getElementById("usability_seal_date")?.value || "";
    validateSealDateField(currentSealDate, value);
  };

  // Handler for basic input field changes with real-time validation
  const handleBasicFieldChange = (fieldName, value) => {
    setValue(fieldName, value);

    // Real-time validation for required fields
    if (fieldName === "name") {
      validateNameField(value);
    } else if (fieldName === "initial_url") {
      validateUrlField(value);
    }

    // If field becomes empty, switch to tab1 where basic fields are
    if (!value || value.trim() === "") {
      setActiveTab("tab1");
    }
  };

  // Handler for date field changes with conditional validation
  const handleDateFieldChange = (fieldName, value, tabKey) => {
    setValue(fieldName, value);

    // Real-time conditional validation for date fields
    if (fieldName === "accessibility_declaration_date") {
      validateDeclarationDateField(value, complianceValue);
    } else if (fieldName === "usability_seal_date") {
      validateSealDateField(value, typeSealValue);
    }

    // If field becomes empty, switch to the appropriate tab
    if (!value || value.trim() === "") {
      setActiveTab(tabKey);
    }
  };

  // Function to determine which tab contains validation errors
  const getTabWithErrors = (isCategoryValid, isComplianceValid, isTypeSealValid, formErrors) => {
    // Check basic form fields (tab1 - name, initial_url)
    if (formErrors.name || formErrors.initial_url) {
      return "tab1"; // Basic information tab
    }

    // Check declaration fields (tab1 - accessibility_declaration_date)
    if (formErrors.accessibility_declaration_date) {
      return "tab1"; // Declaration tab
    }

    // Check seal fields (tab2 - usability_seal_date)
    if (formErrors.usability_seal_date) {
      return "tab2"; // Usability seal tab
    }

    // Check associations (tab3 - categories)
    if (!isCategoryValid) {
      return "tab3"; // Associations tab
    }

    // Default to first tab if no specific errors found
    return "tab1";
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Validate all form fields before submitting
    const isCategoryValid = validateCategories(categoryValue);
    const isComplianceValid = validateCompliance(data.compliance);
    const isTypeSealValid = validateTypeSeal(data.type_seal);

    // Conditional date validations
    const declarationDateValidation = validateDeclarationDate(data.accessibility_declaration_date, complianceValue || data.compliance);
    const sealDateValidation = validateSealDate(data.usability_seal_date, typeSealValue || data.type_seal);

    const hasValidationErrors = !isCategoryValid ||
                               declarationDateValidation.isValid === false ||
                               sealDateValidation.isValid === false;

    if (hasValidationErrors) {
      // Create temporary errors object for date validations
      const tempErrors = { ...errors };
      if (declarationDateValidation.isValid === false) {
        tempErrors.accessibility_declaration_date = { message: declarationDateValidation.message };
      }
      if (sealDateValidation.isValid === false) {
        tempErrors.usability_seal_date = { message: sealDateValidation.message };
      }

      // Switch to the tab containing the validation error
      const errorTab = getTabWithErrors(isCategoryValid, isComplianceValid, isTypeSealValid, tempErrors);
      setActiveTab(errorTab);

      setFeedbackMessage("Por favor, corrija os erros de validação antes de submeter o formulário.");
      setShowFeedbackModal(true);
      setIsSubmitting(false);
      return;
    }

    // O URL vai sempre com trim. Na edição não segue no PATCH geral: tem pedido próprio
    // (PATCH /websites/:id/url), feito no fim e só se o URL mudou.
    const baseUrl = normalizeWebsiteUrl(data.initial_url);
    const urlChanged = Boolean(id) && !isSameWebsiteUrl(baseUrl, originalUrlRef.current);

    try {
      const payload = {
        title: data.name,
        institutionId: institutionValue ? Number(institutionValue) : null,
        ...(!id && { baseUrl }),
      };

      const response = id
        ? await api.patch(`/websites/${id}`, payload)
        : await api.post('/websites', payload);

      if (response.status === 201 || response.status === 200) {
        const websiteId = id ?? response.data?.data?.id ?? response.data?.id;

        const originalIds = new Set(originalCategoryIdsRef.current);
        const currentIds = new Set(categoryValue.map(item => Number(item.value)));
        const add = [...currentIds].filter(catId => !originalIds.has(catId));
        const remove = [...originalIds].filter(catId => !currentIds.has(catId));
        if (websiteId && (add.length > 0 || remove.length > 0)) {
          await api.patch(`/websites/${websiteId}/tags`, { add, remove });
        }

        if (websiteId && data.compliance && data.accessibility_declaration_date) {
          await api.put(`/websites/${websiteId}/declaration`, {
            status: data.compliance,
            dateDeclaration: new Date(data.accessibility_declaration_date).toISOString(),
          });
        }

        if (websiteId && data.type_seal && data.usability_seal_date) {
          await api.put(`/websites/${websiteId}/stamp`, {
            stampLevel: data.type_seal,
            dateStamp: new Date(data.usability_seal_date).toISOString(),
          });
        }

        if (urlChanged) {
          try {
            await updateWebsiteUrl(websiteId, baseUrl);
            originalUrlRef.current = baseUrl;
          } catch (urlError) {
            console.error("Error updating website URL:", urlError);
            setFeedbackMessage(t(getUpdateWebsiteUrlErrorKey(urlError)));
            return;
          }
        }

        setFeedbackMessage(id ? "Sítio Web atualizado com sucesso!" : "Sítio Web criado com sucesso!");

        if (!id) {
          // Only reset form for create mode
          reset();
          setInstitutionValue("");
          setCategoryValue([]);
          setComplianceValue("");
          setTypeSealValue("");
          // Clear validation states
          setCategoryValidation({ isValid: null, message: "" });
          setComplianceValidation({ isValid: null, message: "" });
          setTypeSealValidation({ isValid: null, message: "" });
            // Clear real-time validation states
          setNameValidation({ isValid: null, message: "" });
          setUrlValidation({ isValid: null, message: "" });
          setDeclarationDateValidation({ isValid: null, message: "" });
          setSealDateValidation({ isValid: null, message: "" });
        }
      } else {
        setFeedbackMessage(id ? "Erro ao atualizar Sítio Web. Tente novamente." : "Erro ao criar Sítio Web. Tente novamente.");
      }
    } catch (error) {
      console.error(error);
      if (urlChanged) {
        setFeedbackMessage(t('WEBSITES_PAGE.URL.general_update_error'));
      } else if (error.response?.status === 409) {
        setFeedbackMessage("Já existe um Sítio Web com este nome ou URL.");
      } else if (error.response?.status === 400) {
        setFeedbackMessage("Dados inválidos. Verifique as informações inseridas.");
      } else {
        setFeedbackMessage(id ? "Erro ao atualizar Sítio Web. Tente novamente." : "Erro ao criar Sítio Web. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
      setShowFeedbackModal(true);
    }
  };

  // Breadcrumb built only from the origin carried in this navigation's state
  // (Diretório/Entidade/Categoria ou lista de Sítios web). Não lê o
  // localStorage `previousPath`, que vazava percursos anteriores (issue #131).
  const websiteOrigin = getWebsiteOriginFromState(location.state);
  const websiteNameValue = watch("name");
  const breadcrumbs = [
    ...getWebsiteOriginTrail(websiteOrigin, t).map(({ to, label }) => ({
      children: <Link to={to}>{label}</Link>,
    })),
    ...(id && websiteNameValue
      ? [{
          children: (
            <Link
              to={`/dashboard/websites/view/${id}/${encodeURIComponent(websiteNameValue)}`}
              state={buildWebsiteOriginState(websiteOrigin)}
            >
              {websiteNameValue}
            </Link>
          ),
        }]
      : []),
    { title: id ? t('BREADCRUMB.edit_website') : t('BREADCRUMB.create_website') },
  ];

  const urlErrorMessage = urlValidation?.isValid === false ? urlValidation.message : errors.initial_url?.message;
  const feedbackIsSuccess = feedbackMessage === "Sítio Web criado com sucesso!" || feedbackMessage === "Sítio Web atualizado com sucesso!";

  const TabsWithComponenets = (
    <Tabs
      activeKey={activeTab}
      onSelect={(key) => setActiveTab(key)}
      tabs={[
        {
          component: <AcessibilityDeclaration
            watch={watch}
            register={register}
            errors={errors}
            darkTheme={theme}
            setValue={setValue}
            complianceValidation={complianceValidation}
            onComplianceChange={handleComplianceChange}
            onDateFieldChange={handleDateFieldChange}
            declarationDateValidation={declarationDateValidation}
          />,
          eventKey: 'tab1',
          title: t('WEBSITES_PAGE.ADD.declaration_label')
        },
        {
          component: <UsuabilitySeal
            watch={watch}
            register={register}
            errors={errors}
            darkTheme={theme}
            setValue={setValue}
            typeSealValidation={typeSealValidation}
            onTypeSealChange={handleTypeSealChange}
            onDateFieldChange={handleDateFieldChange}
            sealDateValidation={sealDateValidation}
          />,
          eventKey: 'tab2',
          title: t('WEBSITES_PAGE.ADD.stamp_label')
        },
        {
          component: <Associations
            darkTheme={theme}
            institutionOptions={institutionOptions}
            categoryOptions={categoryOptions}
            institutionValue={institutionValue}
            categoryValue={categoryValue}
            onInstitutionChange={handleInstitutionChange}
            onCategoryChange={handleCategoryChange}
            onCategorySearch={handleCategorySearch}
            isCategoryLoading={isCategoryLoading}
            categoryValidation={categoryValidation}
            />,
          eventKey: 'tab3',
          title: t('WEBSITES_PAGE.ADD.associations_label')
        }
      ]}
    />
  );

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{id ? "Editar Sítio Web" : t('WEBSITES_PAGE.ADD.title')}</h1>
      <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
        {/* Seção 1: Informações básicas */}
        <p>{t('WEBSITES_PAGE.ADD.description_website')}</p>
        <div >
          <h2 className="mb-4">{id ? "Editar Sítio Web" : t('WEBSITES_PAGE.ADD.new_website')}</h2>
          <div className="w-50 d-flex flex-column gap-4">
            <Input
              value={watch("name")}
              label={t('WEBSITES_PAGE.ADD.name_label')}
              {...register("name", { required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} /> })}
              error={nameValidation?.isValid === false ? nameValidation.message : errors.name?.message}
              darkTheme={theme}
              onChange={e => handleBasicFieldChange("name", e.target.value)}
            />
            <Input
              id="initial_url"
              value={watch("initial_url")}
              label={t('WEBSITES_PAGE.URL.label')}
              {...register("initial_url", {
                validate: (value) => {
                  const urlErrorKey = getWebsiteUrlErrorKey(value);
                  return urlErrorKey ? t(urlErrorKey) : true;
                },
              })}
              aria-invalid={Boolean(urlErrorMessage)}
              aria-describedby={urlErrorMessage ? "initial_url-error" : undefined}
              error={urlErrorMessage ? <span id="initial_url-error">{urlErrorMessage}</span> : undefined}
              darkTheme={theme}
              onChange={e => handleBasicFieldChange("initial_url", e.target.value)}
            />
          </div>
        </div>
        {/* Seção 2: Declaração e Selo */}
        <div className=" mt-5">
          {TabsWithComponenets}
          <div className="d-flex justify-content-start gap-3 mt-4">
            <Button
              type="submit"
              text={isSubmitting ? "A guardar..." : (id ? "Atualizar e Sair" : "Guardar e Sair")}
              variant="primary"
              style={{width: "150px"}}
              darkTheme={theme}
              disabled={isSubmitting}
            />
            <Button
              type="button"
              className="ms-3"
              style={{width: "150px"}}
              text="Sair"
              variant="danger"
              darkTheme={theme}
              onClick={() => navigate('/dashboard/websites')}
            />
          </div>
        </div>
      </form>
      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title={id ? "Editar Sítio Web" : "Criar Sítio Web"}
      >
        <p role={feedbackIsSuccess ? undefined : "alert"}>{feedbackMessage}</p>
        <Button
          darkTheme={theme}
          text="OK"
          type="button"
          className="btn-primary"
          onClick={() => {
            setShowFeedbackModal(false);
            if (feedbackIsSuccess) {
              navigate('/dashboard/websites');
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default WebSiteCreateForm;
