import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    if (formData.password.length < 6) errs.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(formData.name, formData.email, formData.phone, formData.password);
      navigate('/citizen/dashboard');
    } catch (err) {
      // handled by store
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="lg:hidden mb-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-subtle">Civic Tech Platform</span>
        <h1 className="text-2xl font-bold text-foreground mt-1">RIRRS</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Create account</h2>
        <p className="text-sm text-muted mt-1">Join the community and start reporting road issues</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" icon={User} placeholder="Your full name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} error={errors.name} required />
        <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={formData.email} onChange={(e) => updateField('email', e.target.value)} error={errors.email} required />
        <Input label="Phone" type="tel" icon={Phone} placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} error={errors.phone} required />
        <Input label="Password" type="password" icon={Lock} placeholder="Min 6 characters" value={formData.password} onChange={(e) => updateField('password', e.target.value)} error={errors.password} required />
        <Input label="Confirm Password" type="password" icon={Lock} placeholder="Repeat your password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} error={errors.confirmPassword} required />

        <Button type="submit" size="lg" loading={isLoading} className="w-full" iconRight={ArrowRight}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};

export default Register;
