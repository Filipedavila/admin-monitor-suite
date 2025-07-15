import React from 'react';
import { Input, Button, RadioGroup, Select } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from 'ama-design-system';
import { Link } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
const UsersGovCreateForm = () => {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { theme } = useTheme();
    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };
    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> }, 
        {
            title: t('GOV_USERS_PAGE.ADD.title'),
        }
    ];
    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{t('GOV_USERS_PAGE.ADD.title')}</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <p>{t('GOV_USERS_PAGE.ADD.description_usergov')}</p>
                <p>{t('GOV_USERS_PAGE.ADD.description_usergov1')}</p>
                <p>{t('GOV_USERS_PAGE.ADD.description_usergov2')}</p>
                <div className='w-50 d-flex flex-column gap-3'>
                    <Input
                        id="username"
                        darkTheme={theme}
                        label={t('GOV_USERS_PAGE.ADD.username_label')}
                        name="username"
                        type="text"
                        {...register("username", { required: true })}
                        error={errors.username ? t('MISC.required_field') : undefined}
                    />

                    <Input
                        id="citizen_card_number"
                        label={t('GOV_USERS_PAGE.ADD.card_citizen_label')}
                        name="citizen_card_number"
                        type="text"
                        darkTheme={theme}
                        {...register("citizen_card_number", { required: true })}
                        error={errors.citizen_card_number ? t('MISC.required_field') : undefined}
                    />

    

                    <Select
                        id="associated_users"
                        darkTheme={theme}
                        label={t('GOV_USERS_PAGE.ADD.users_associated_label')}
                        name="associated_users"
                        {...register("entities", { required: true })}
                        error={errors.entities ? "Campo obrigatório" : undefined}
                        options={[
                            { value: "1", label: "Utilizador 1" },
                            { value: "2", label: "Utilizador 2" },
                            { value: "3", label: "Utilizador 3" },
                            { value: "4", label: "Utilizador 4" },
                        ]}
                    >
                    </Select>

                    <div className="d-flex justify-content-start">
                        <Button
                            darkTheme={theme}
                            type="submit"
                            text={t('ADMIN_CONSOLE.save_and_exit')}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
export default UsersGovCreateForm;