import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

export function Dropdown({
  trigger,
  children,
  align = 'right',
  className = '',
  isOpen: controlledIsOpen,
  onOpenChange
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (nextOpen) => {
    if (!isControlled) {
      setInternalIsOpen(nextOpen);
    }
    if (onOpenChange) {
      onOpenChange(nextOpen);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`ats-dropdown-container ${className}`} ref={dropdownRef}>
      <div
        className="ats-dropdown-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`ats-dropdown-menu align-${align}`}
          onClick={(e) => e.stopPropagation()}
        >
          {typeof children === 'function' ? children({ close: () => setIsOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  icon: Icon,
  danger = false,
  onClick,
  className = ''
}) {
  return (
    <button
      type="button"
      className={`ats-dropdown-item ${danger ? 'is-danger' : ''} ${className}`}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="ats-dropdown-divider" />;
}

export default Dropdown;
