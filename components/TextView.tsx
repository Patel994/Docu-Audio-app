
import React from 'react';

interface TextViewProps {
  text: string;
}

const TextView: React.FC<TextViewProps> = ({ text }) => {
  return (
    <div className="w-full flex flex-col items-center flex-grow">
      <h2 className="text-xl font-semibold mb-4 text-slate-700 self-start">Extracted Text</h2>
      <textarea
        readOnly
        value={text}
        className="w-full flex-grow p-4 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 text-base leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-none min-h-[300px]"
        aria-label="Extracted text from document"
      />
    </div>
  );
};

export default TextView;
