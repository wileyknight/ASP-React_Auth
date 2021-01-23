using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using ASPReact_Auth.Models;
using Microsoft.AspNetCore.Authorization;
using IdentityServer4.Services;

namespace ASPReact_Auth.Controllers
{
    public class AuthorizationController : Controller
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IIdentityServerInteractionService _interactionService;

        public AuthorizationController(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IIdentityServerInteractionService interactionService)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _interactionService = interactionService;
        }

        // ** Login Fuctions
        [HttpGet]
        public IActionResult Login(string returnUrl)
        {
            return Redirect(returnUrl);
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginViewModel loginViewModel)
        {
            // check if model is valid 

            var result = await _signInManager.PasswordSignInAsync(loginViewModel.Username, loginViewModel.Password, false, false);

            if (result.Succeeded)
            {
                return Ok(loginViewModel.ReturnUrl);
            }
            else if(result.IsLockedOut)
            {
                return Ok(new { error = "Lockout"});
            }
            
            return Ok(new { error = "Failed"});
        }

        // ** Register Functions
        [HttpGet]
        public IActionResult Register(string returnUrl)
        {
            return Ok(new { url = returnUrl } );
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel registerViewModel)
        {
            if (!ModelState.IsValid)
            {
                return Ok(new { error = registerViewModel });
            }

            var user = new IdentityUser(registerViewModel.Username);

            var result = await _userManager.CreateAsync(user, registerViewModel.Password);

            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(user, false);

                return Ok(new { returnUrl = registerViewModel.ReturnUrl });
            }

            return Ok(new { error = "Failed" });
        }

        [Authorize]
        public IActionResult IsAllowed()
        {
            var obj = new { authenticated = "true" };

            return Ok(obj);
        }

        [HttpPost]
        public async Task<IActionResult> Logout([FromBody] string returnUrl)
        {
            await _signInManager.SignOutAsync();

            var logoutRequest = await _interactionService.GetLogoutContextAsync(returnUrl);

            if (string.IsNullOrEmpty(logoutRequest.PostLogoutRedirectUri))
            {
                return Ok(new { returnUrl = "index" });
            }

            return Ok(new { returnUrl = logoutRequest.PostLogoutRedirectUri});
        }

        [Route("_configuration/[action]")]
        public IActionResult ReactAuth()
        {
            return Ok( new
            {
                authority = "https://localhost:5001",
                client_id = "client_id_js",
                redirect_uri = "https://localhost:5001/authentication/login-callback",
                response_type = "code",
                scope = "openid profile IdentityServerApi",
                post_logout_redirect_uri = "https://localhost:5001/"
            });
        }
    }
}
