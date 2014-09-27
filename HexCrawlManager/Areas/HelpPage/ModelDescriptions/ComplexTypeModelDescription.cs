using System.Collections.ObjectModel;

namespace HexCrawlManager.Areas.HelpPage.ModelDescriptions
{
   /// <summary>
   /// 
   /// </summary>
    public class ComplexTypeModelDescription : ModelDescription
    {
        public ComplexTypeModelDescription()
        {
            Properties = new Collection<ParameterDescription>();
        }

        public Collection<ParameterDescription> Properties { get; private set; }
    }
}