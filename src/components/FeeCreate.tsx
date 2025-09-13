import React, { useState } from 'react';
import { CreateFeeRequest } from '../types/Fee';
import { feeService } from '../services/feeService';

const FeeCreate: React.FC = () => {
  const [formData, setFormData] = useState<CreateFeeRequest>({
    code: '',
    value: 0,
    description: '',
    status: 'draft'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Amount must be greater than 0';
    }

    if (formData.value > 1000) {
      newErrors.value = 'Amount must be less than or equal to 1000';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Hide success message when form is modified
    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await feeService.createFee(formData);

      setSuccessMessage('Fee created successfully!');
      setSuccess(true);

      // Reset form
      setFormData({
        code: '',
        value: 0,
        description: '',
        status: 'draft'
      });

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrors({ code: 'This fee code already exists. Please choose another.' });
      } else if (error.response?.status === 400) {
        setErrors({ general: 'Invalid data provided. Please check all fields.' });
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create New Fee</h2>

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setSuccess(false)}
          ></button>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="alert alert-danger" role="alert">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Code field */}
        <div className="mb-3">
          <label htmlFor="code" className="form-label">Code</label>
          <input
            id="code"
            name="code"
            type="text"
            className={`form-control ${errors.code ? 'is-invalid' : ''}`}
            value={formData.code}
            onChange={handleInputChange}
            required
          />
          {errors.code && (
            <div className="invalid-feedback">
              {errors.code}
            </div>
          )}
        </div>

        {/* Value field */}
        <div className="mb-3">
          <label htmlFor="value" className="form-label">Amount</label>
          <input
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0.01"
            max="1000"
            className={`form-control ${errors.value ? 'is-invalid' : ''}`}
            value={formData.value || ''}
            onChange={handleInputChange}
            required
          />
          {errors.value && (
            <div className="invalid-feedback">
              {errors.value}
            </div>
          )}
        </div>

        {/* Description field */}
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            name="description"
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            rows={3}
            placeholder="Enter fee description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
          {errors.description && (
            <div className="invalid-feedback">
              {errors.description}
            </div>
          )}
        </div>

        {/* Status field */}
        <div className="mb-3">
          <label htmlFor="status" className="form-label">Status</label>
          <select
            id="status"
            name="status"
            className={`form-select ${errors.status ? 'is-invalid' : ''}`}
            value={formData.status}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a status</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="live">Live</option>
          </select>
          {errors.status && (
            <div className="invalid-feedback">
              {errors.status}
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Creating...
            </>
          ) : (
            'Create Fee'
          )}
        </button>
      </form>
    </div>
  );
};

export default FeeCreate;