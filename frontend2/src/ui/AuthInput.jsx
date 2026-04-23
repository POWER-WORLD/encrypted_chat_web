import React from 'react';

const AuthInput = ({ icon: Icon, type, placeholder, name, value, onChange, accept }) => {
  const isFile = type === 'file';

  return (
    <div className="relative group">
      {/* Dynamic Glow Effect on Focus */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 blur"></div>
      
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300 pointer-events-none">
          <Icon size={18} strokeWidth={2.5} />
        </div>
        
        <input
          type={type}
          name={name}
          value={isFile ? undefined : value} // File inputs cannot have a value prop
          onChange={onChange}
          placeholder={placeholder}
          accept={accept}
          required
          className={`w-full bg-slate-900/60 border border-slate-600/60 text-white pl-12 pr-4 py-3.5 rounded-xl outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 font-light text-sm tracking-wide ${
            isFile 
              ? 'file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer text-slate-500' 
              : ''
          }`}
        />
      </div>
    </div>
  );
};

export default AuthInput;
