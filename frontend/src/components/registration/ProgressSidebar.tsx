interface ProgressSidebarProps {
  currentStep: 1 | 2 | 3;
}

const ProgressSidebar = ({ currentStep }: ProgressSidebarProps) => {
  const steps = [
    { number: 1, label: "Profile Info" },
    { number: 2, label: "Skills" },
    { number: 3, label: "Preferences" },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center gap-2">
            {/* Step indicator */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={{
                backgroundColor: currentStep >= step.number ? '#A6F4C5' : 'rgba(228, 228, 231, 0.25)',
                color: currentStep >= step.number ? '#111118' : 'rgba(255, 255, 255, 0.5)',
                border: '2px solid',
                borderColor: currentStep >= step.number ? '#A6F4C5' : 'rgba(255, 255, 255, 0.25)',
              }}
            >
              {step.number}
            </div>
            
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div 
                className="w-1 h-24 rounded-full transition-all"
                style={{
                  background: currentStep > step.number 
                    ? 'linear-gradient(180deg, #6ADDBC 0%, #3C846F 100%)'
                    : 'rgba(228, 228, 231, 0.25)',
                  border: '1px solid',
                  borderColor: currentStep > step.number 
                    ? 'transparent' 
                    : 'rgba(255, 255, 255, 0.25)',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSidebar;
