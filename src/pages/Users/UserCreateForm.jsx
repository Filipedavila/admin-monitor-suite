import React from 'react';
import { Input, Button, RadioGroup, Breadcrumb } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
const UsersCreateForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { t } = useTranslation();
    const { theme } = useTheme();
    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };
    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        {
            title: t('USERS_PAGE.ADD.title'),
        }
    ];
    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{t('USERS_PAGE.ADD.title')}</h1>
            <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
                <p>{t('USERS_PAGE.ADD.description_user')}</p>
                <p>{t('USERS_PAGE.ADD.description_user_ams')}</p>
                <div className='w-50 d-flex flex-column gap-3'>
                <Input
                    label={t('USERS_PAGE.ADD.username_label')}
                    name="username"
                    type="text"
                    darkTheme={theme}
                    {...register("username", { required: true })}
                    error={errors.username ? t('MISC.required_field') : undefined}
                />
{

       /*       
                <Input
                label={t('USERS_PAGE.ADD.names_label')}
                    name="contact_name"
                    type="text"
                    darkTheme={theme}
                    {...register("contact_name", { required: true })}
                    error={errors.contact_name ? t('MISC.required_field') : undefined}
                />

                <Input
                    label={t('USERS_PAGE.ADD.emails_label')}
                    name="email"
                    type="email"
                    darkTheme={theme}
                    {...register("email", { required: true })}
                    error={errors.email ? t('MISC.required_field') : undefined}
                    />*/
                }
                  <Input
                    label={t('USERS_PAGE.ADD.password_label')}
                    name="password"
                    type="password"
                    showPassTextAria={t('LOGIN.show_password')}
                    hidePassTextAria={t('LOGIN.hide_password')}
                    {...register("password", { required: true })}
                    darkTheme={theme}
                    error={errors.password ? t('MISC.required_field') : undefined}
                />

                <Input
                    label={t('USERS_PAGE.ADD.confirm_password_label')}
                    name="confirmPassword"
                    type="password"
                    showPassTextAria={t('LOGIN.show_password')}
                    hidePassTextAria={t('LOGIN.hide_password')}
                    {...register("confirmPassword", { required: true })}
                    darkTheme={theme}
                    error={errors.confirmPassword ? t('MISC.required_field') : undefined}
                />

                 <div>
                    <RadioGroup
                        darkTheme={theme}
                        data={[
                            {
                                id: '1',
                                name: t('MENU.study_monitor')
                            },
                            {
                                id: '2',
                                name: t('MENU.my_monitor')
                            }, {
                                id: '3',
                                name: t('MENU.access_monitor')
                            },
                        ]}
                        inline
                        onChange={() => { }}
                        value="1"
                    />
                </div>
              
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
export default UsersCreateForm;