import React from 'react';

const AuthInput = ({ icon: Icon, type, placeholder, name, value, onChange, accept, required = true }) => {
  const isFile = type === 'file';

  return (
    <div className="relative group">
      {/* Dynamic Glow Effect on Focus */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-indigo-600 rounded-xl opacity-0 group-focus-within:opacity-25 transition duration-500 blur"></div>
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-400 transition-colors duration-300 pointer-events-none">
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
        
        <input
          type={type}
          name={name}
          id={name || placeholder}
          value={isFile ? undefined : value}
          onChange={onChange}
          placeholder={placeholder}
          accept={accept}
          required={required}
          aria-label={placeholder}
          className={`w-full bg-zinc-950/80 border border-zinc-800 text-green-300 ${
            Icon ? 'pl-12' : 'pl-4'
          } pr-4 py-3.5 rounded-xl outline-none focus:border-green-500/70 focus:ring-1 focus:ring-green-500/30 transition-all placeholder:text-zinc-600 font-mono text-sm tracking-wide ${
            isFile 
              ? 'file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-green-600 file:text-black hover:file:bg-green-500 cursor-pointer text-zinc-400' 
              : ''
          }`}
        />
      </div>
    </div>
  );
};

export default AuthInput;
