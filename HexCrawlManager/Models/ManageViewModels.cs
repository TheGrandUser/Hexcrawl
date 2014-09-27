using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;

namespace HexCrawlManager.Models
{
   /// <summary>
   /// 
   /// </summary>
   public class IndexViewModel
   {
      public bool HasPassword { get; set; }
      public IList<UserLoginInfo> Logins { get; set; }
      public string PhoneNumber { get; set; }
      public bool TwoFactor { get; set; }
      public bool BrowserRemembered { get; set; }
   }

   /// <summary>
   /// 
   /// </summary>
   public class ManageLoginsViewModel
   {
      public IList<UserLoginInfo> CurrentLogins { get; set; }
      public IList<AuthenticationDescription> OtherLogins { get; set; }
   }

   /// <summary>
   /// 
   /// </summary>
   public class FactorViewModel
   {
      public string Purpose { get; set; }
   }

   /// <summary>
   /// 
   /// </summary>
   public class SetPasswordViewModel
   {
      [Required]
      [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
      [DataType(DataType.Password)]
      [Display(Name = "New password")]
      public string NewPassword { get; set; }

      [DataType(DataType.Password)]
      [Display(Name = "Confirm new password")]
      [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
      public string ConfirmPassword { get; set; }
   }

   /// <summary>
   /// 
   /// </summary>
   public class ChangePasswordViewModel
   {
      [Required]
      [DataType(DataType.Password)]
      [Display(Name = "Current password")]
      public string OldPassword { get; set; }

      [Required]
      [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
      [DataType(DataType.Password)]
      [Display(Name = "New password")]
      public string NewPassword { get; set; }

      [DataType(DataType.Password)]
      [Display(Name = "Confirm new password")]
      [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
      public string ConfirmPassword { get; set; }
   }

   /// <summary>
   /// 
   /// </summary>
   public class AddPhoneNumberViewModel
   {
      [Required]
      [Phone]
      [Display(Name = "Phone Number")]
      public string Number { get; set; }
   }

   /// <summary>
   /// 
   /// </summary>
   public class VerifyPhoneNumberViewModel
   {
      /// <summary>
      /// 
      /// </summary>
      [Required]
      [Display(Name = "Code")]
      public string Code { get; set; }

      /// <summary>
      /// 
      /// </summary>
      [Required]
      [Phone]
      [Display(Name = "Phone Number")]
      public string PhoneNumber { get; set; }
   }

   /// <summary>
   /// 
   /// </summary>
   public class ConfigureTwoFactorViewModel
   {
      /// <summary>
      /// 
      /// </summary>
      public string SelectedProvider { get; set; }
      /// <summary>
      /// 
      /// </summary>
      public ICollection<System.Web.Mvc.SelectListItem> Providers { get; set; }
   }
}