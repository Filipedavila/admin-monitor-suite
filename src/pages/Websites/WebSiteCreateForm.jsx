import React, { useState, useEffect } from "react";
import { Input, Button, Select, Tabs, Breadcrumb } from "ama-design-system";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import AcessibilityDeclaration from "./Tabs/acessiblityDeclaration";
import UsuabilitySeal from "./Tabs/usuabilitySeal";
import Associations from "./Tabs/associations";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';
import debounce from 'lodash/debounce';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [activeTab, setActiveTab] = useState("tab1");
  const { id } = useParams();
  useEffect(() => {
  }, [errors]);
  // State for options and search
  const [entityOptions, setEntityOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [entitySearch, setEntitySearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // State for selected values of MultiSelects
  const [entityValue, setEntityValue] = useState([]);
  const [userValue, setUserValue] = useState([]);
  const [categoryValue, setCategoryValue] = useState([]);

  const [defaultEntities, setDefaultEntities] = useState([]);
  const [defaultUsers, setDefaultUsers] = useState([]);
  const [defaultCategories, setDefaultCategories] = useState([]);
  // State for Select values to track conditional validation
  const [complianceValue, setComplianceValue] = useState("");
  const [typeSealValue, setTypeSealValue] = useState("");

  // State for real-time validation messages
  const [nameValidation, setNameValidation] = useState({ isValid: null, message: "" });
  const [urlValidation, setUrlValidation] = useState({ isValid: null, message: "" });
  const [declarationDateValidation, setDeclarationDateValidation] = useState({ isValid: null, message: "" });
  const [sealDateValidation, setSealDateValidation] = useState({ isValid: null, message: "" });

  // Validation state for MultiSelects
  const [entityValidation, setEntityValidation] = useState({ isValid: null, message: "" });
  const [userValidation, setUserValidation] = useState({ isValid: null, message: "" });
  const [categoryValidation, setCategoryValidation] = useState({ isValid: null, message: "" });

  // Validation state for Selects
  const [complianceValidation, setComplianceValidation] = useState({ isValid: null, message: "" });
  const [typeSealValidation, setTypeSealValidation] = useState({ isValid: null, message: "" });

  // Validation functions for MultiSelects
  const validateEntities = (selected) => {
    // Entities are optional, but if selected, validate count
    if (selected && selected.length > 5) {
      setEntityValidation({ isValid: false, message: "Máximo de 5 entidades permitidas." });
      return false;
    }
    if (selected && selected.length > 0) {
      setEntityValidation({ isValid: true, message: "Entidades válidas selecionadas." });
    } else {
      setEntityValidation({ isValid: null, message: "" });
    }
    return true;
  };

  const validateUsers = (selected) => {
    // Users are optional, but if selected, validate count
    if (selected && selected.length > 3) {
      setUserValidation({ isValid: false, message: "Máximo de 3 utilizadores permitidos." });
      return false;
    }
    if (selected && selected.length > 0) {
      setUserValidation({ isValid: true, message: "Utilizadores válidos selecionados." });
    } else {
      setUserValidation({ isValid: null, message: "" });
    }
    return true;
  };

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
    if (!value || value === "0") {
      setComplianceValidation({ isValid: null, message: "" });
      return true;
    }
    setComplianceValidation({ isValid: true, message: "Conformidade válida selecionada." });
    return true;
  };

  const validateTypeSeal = (value) => {
    // Type seal is optional - no validation needed if empty
    if (!value || value === "0") {
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
    if (!value || value.trim() === "") {
      setUrlValidation({ isValid: false, message: "URL Inicial é obrigatória." });
      return false;
    }
    setUrlValidation({ isValid: true, message: "" });
    return true;
  };

  // Conditional validation for dates with real-time updates
  const validateDeclarationDateField = (dateValue, complianceValue) => {
    // If compliance is selected, date is required
    if (complianceValue && complianceValue !== "0") {
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
    if (typeSealValue && typeSealValue !== "0") {
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

  // Debounced fetchers
  const fetchEntities = async (searchTerm) => {
    const res = await api.get(`/entity/all/40/0/sort=/direction=/search=${searchTerm || ''}`);
    console.log(res.data.result);
    setEntityOptions((res.data.result || []).map(e => ({ value: e.EntityId || e.id, label: e.Long_Name + " - " + e.Short_Name })));
  }

  const fetchUsers = async (searchTerm) => {
    const res = await api.get(`/user/all`);
    setUserOptions((res.data.result || []).map(u => ({ value: u.UserId || u.id, label: u.Username })));
  }

  const fetchCategories = async (searchTerm) => {
    const res = await api.get(`/tag/all`);
    setCategoryOptions((res.data.result || []).map(c => ({ value: c.TagId, label: c.Name  })));
  }

  // Initial load
  useEffect(() => {
    fetchEntities("");
    fetchUsers("");
    fetchCategories("");
  }, []);

  // Load website data for editing
  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const response = await api.get(`/website/info/${id}`);
        const websiteData = response.data.result;
        
        // Set basic form fields
        setValue("name", websiteData.Name || "");
        setValue("initial_url", websiteData.StartingUrl || "");
        setValue("compliance", websiteData.Declaration || "");
        setValue("accessibility_declaration_date", websiteData.Declaration_Update_Date || "");
        setValue("type_seal", websiteData.Stamp || "");
        setValue("usability_seal_date", websiteData.Stamp_Update_Date || "");
        setEntityValue(websiteData.entities.map(e => e.EntityId));
        setUserValue([websiteData.UserId]);
        setCategoryValue(websiteData.tags.map(c => c.TagId));
        setDefaultEntities(websiteData.entities.map(e => e.EntityId));
        setDefaultUsers([websiteData.UserId]);
        setDefaultCategories(websiteData.tags.map(c => c.TagId));
        // Set compliance and seal values for validation
        setComplianceValue(websiteData.Declaration || "");
        setTypeSealValue(websiteData.Stamp || "");
        
   
        
        // Clear validation states for edit mode
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

  // Handlers for MultiSelect search
  const handleEntitySearch = (value) => {
    setEntitySearch(value || "");
    fetchEntities(value || "");
  };
  const handleUserSearch = (value) => {
    setUserSearch(value || "");
    fetchUsers(value || "");
  };
  const handleCategorySearch = (value) => {
    setCategorySearch(value || "");
    fetchCategories(value || "");
  };

  // Handlers for MultiSelect change with validation
  const handleEntityChange = (selected) => {
    const validatedSelection = selected || [];
    setValue("entities", validatedSelection);
    setEntityValue(validatedSelection);
    validateEntities(validatedSelection);
  };
  
  const handleUserChange = (selected) => {
    const validatedSelection = selected || [];
    setValue("users", validatedSelection);
    setUserValue(validatedSelection);
    const isValid = validateUsers(validatedSelection);
    // If validation fails, switch to the associations tab
    if (!isValid) {
      setActiveTab("tab3");
    }
  };
  
  const handleCategoryChange = (selected) => {
    const validatedSelection = selected || [];
    setValue("categories", validatedSelection);
    setCategoryValue(validatedSelection);
    const isValid = validateCategories(validatedSelection);
    // If validation fails, switch to the associations tab
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
  const getTabWithErrors = (isEntityValid, isUserValid, isCategoryValid, isComplianceValid, isTypeSealValid, formErrors) => {
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
    
    // Check associations (tab3 - users, categories)
    if (!isUserValid || !isCategoryValid) {
      return "tab3"; // Associations tab
    }
    
    // Default to first tab if no specific errors found
    return "tab1";
  };

  // Helper function to format date to ISO format
  const formatDateToISO = (dateString) => {
    if (!dateString) return null;
    
    // Check if the date is in dd/mm/yyyy format
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return date.toISOString();
    }
    
    if (dateString.includes('-') && dateString.length === 10) {
      const date = new Date(dateString + 'T00:00:00.000Z');
      return date.toISOString();
    }
    
    // Otherwise, assume it's in standard format
    const date = new Date(dateString);
    return date.toISOString();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
  
    // Validate all form fields before submitting
    const isEntityValid = validateEntities(entityValue);
    const isUserValid = validateUsers(userValue);
    const isCategoryValid = validateCategories(categoryValue);
    const isComplianceValid = validateCompliance(data.compliance);
    const isTypeSealValid = validateTypeSeal(data.type_seal);
    
    // Conditional date validations
    const declarationDateValidation = validateDeclarationDate(data.accessibility_declaration_date, complianceValue || data.compliance);
    const sealDateValidation = validateSealDate(data.usability_seal_date, typeSealValue || data.type_seal);
    
    const hasValidationErrors = !isUserValid || !isCategoryValid || 
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
      const errorTab = getTabWithErrors(isEntityValid, isUserValid, isCategoryValid, isComplianceValid, isTypeSealValid, tempErrors);
      setActiveTab(errorTab);
      
      setFeedbackMessage("Por favor, corrija os erros de validação antes de submeter o formulário.");
      setShowFeedbackModal(true);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare payload as needed by your API
      const payload = !(id) ? {
        name: data.name,
        startingUrl: data.initial_url,
        declaration: data.compliance,
        declaration_Update_Date: formatDateToISO(data.accessibility_declaration_date),
        stamp: data.type_seal,
        stamp_Update_Date: formatDateToISO(data.usability_seal_date),
        entities: (entityValue || []).map(e => e.value || e),
        users: null,
        categories: (categoryValue || []).map(c => c.value || c),
      } : {
        name: data.name,
        startingUrl: data.initial_url,
        declaration: data.compliance === "" ? null : data.compliance ,
        declarationUpdateDate: formatDateToISO(data.accessibility_declaration_date),
        stamp: data.type_seal === "" ? null : data.type_seal,
        stampUpdateDate: formatDateToISO(data.usability_seal_date),
        userId: null,
        olderUserId: null,
        entities: (entityValue || []).map(e => e.value || e),
        tags: (categoryValue || []).map(c => c.value || c),
        defaultTags: defaultCategories,
        defaultEntities: defaultEntities,
        websiteId: id,
      };

      // Choose endpoint based on whether we're editing or creating
      const response = id 
        ? await api.post(`/website/update`, payload)
        : await api.post('/website/create', payload);

      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage(id ? "Sítio Web atualizado com sucesso!" : "Sítio Web criado com sucesso!");
        
        if (!id) {
          // Only reset form for create mode
          reset();
          setEntityValue([]);
          setUserValue([]);
          setCategoryValue([]);
          setComplianceValue("");
          setTypeSealValue("");
          // Clear validation states
          setEntityValidation({ isValid: null, message: "" });
          setUserValidation({ isValid: null, message: "" });
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
      console.log(error)
      if (error.response?.status === 409) {
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

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { children: <Link to="/dashboard/websites">Sítios Web</Link> },
    { title: id ? "Editar Sítio Web" : "Criar Sítio Web" },
  ];

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
            watch={watch}
            register={register}
            errors={errors}
            darkTheme={theme}
            entityOptions={entityOptions}
            userOptions={userOptions}
            categoryOptions={categoryOptions}
            entityValue={entityValue}
            userValue={userValue}
            categoryValue={categoryValue}
            onEntityChange={handleEntityChange}
            onUserChange={handleUserChange}
            onCategoryChange={handleCategoryChange}
            onEntitySearch={handleEntitySearch}
            entitySearch={entitySearch || ""}
            onUserSearch={handleUserSearch}
            userSearch={userSearch || ""}
            onCategorySearch={handleCategorySearch}
            categorySearch={categorySearch || ""}
            setValue={setValue}
            // Validation props
            entityValidation={entityValidation}
            userValidation={userValidation}
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
              value={watch("initial_url")}
              label="URL Inicial"
              {...register("initial_url", { required: "Campo obrigatório" })}
              error={urlValidation?.isValid === false ? urlValidation.message : errors.initial_url?.message}
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
        <p>{feedbackMessage}</p>
        <Button
          darkTheme={theme}
          text="OK"
          type="button"
          className="btn-primary"
          onClick={() => {
            setShowFeedbackModal(false);
            if (feedbackMessage === "Sítio Web criado com sucesso!" || feedbackMessage === "Sítio Web atualizado com sucesso!") {
              navigate('/dashboard/websites');
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default WebSiteCreateForm;
