import React, { useState } from 'react'
import './Auth.css'

const Auth = ({ onLogin, translations }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = translations.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = translations.invalidCredentials
    }

    if (!formData.password.trim()) {
      newErrors.password = translations.passwordRequired
    } else if (formData.password.length < 6) {
      newErrors.password = translations.passwordMinLength || 'Password must be at least 6 characters'
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = translations.nameRequired
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = translations.passwordsDoNotMatch
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) return

    if (isLogin) {
      // Login
      const users = JSON.parse(localStorage.getItem('kanban-users') || '[]')
      const user = users.find(
        (u) => u.email === formData.email && u.password === formData.password
      )

      if (user) {
        onLogin(user)
      } else {
        setErrors({ general: translations.invalidCredentials })
      }
    } else {
      // Register
      const users = JSON.parse(localStorage.getItem('kanban-users') || '[]')

      if (users.find((u) => u.email === formData.email)) {
        setErrors({ email: translations.emailExists })
        return
      }

      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        password: formData.password, // In production, this should be hashed
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem('kanban-users', JSON.stringify(users))
      onLogin(newUser)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      })
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isLogin ? translations.login : translations.register}</h1>

        {errors.general && <div className="error-message">{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>{translations.name}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={translations.name}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label>{translations.email}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={translations.email}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>{translations.password}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={translations.password}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>{translations.confirmPassword}</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={translations.confirmPassword}
              />
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? translations.login : translations.register}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>
              <span>{translations.dontHaveAccount}</span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false)
                  setErrors({})
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                  })
                }}
                className="link-btn"
              >
                {translations.registerHere}
              </button>
            </>
          ) : (
            <>
              <span>{translations.alreadyHaveAccount}</span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true)
                  setErrors({})
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                  })
                }}
                className="link-btn"
              >
                {translations.loginHere}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth

