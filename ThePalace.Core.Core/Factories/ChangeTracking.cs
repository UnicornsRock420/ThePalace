using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace ThePalace.Core.Factories
{
    public abstract class ChangeTracking : INotifyPropertyChanged
    {
        public DateTime? LastModified;
        protected bool isDirty = false;

        protected ChangeTracking()
        {
        }

        public event PropertyChangedEventHandler PropertyChanged;

        public void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            isDirty = true;
            LastModified = DateTime.UtcNow;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public bool HasUnsavedChanges
        {
            get => isDirty;
            set
            {
                isDirty = value;
            }
        }

        public void Touch()
        {
            isDirty = true;
        }

        public void AcceptChanges()
        {
            LastModified = DateTime.UtcNow;
            isDirty = false;
        }
    }
}
