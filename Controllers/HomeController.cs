using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using System.Text;

namespace ASPReact_Auth.Controllers
{
    public class HomeController : Controller
    {

        public IActionResult Index()
        {
            return Ok(new { home = "empty" });
        }
        /*
        [Authorize]
        public IActionResult Secret()
        {
            return Ok(new { secret = "Authenticated" });
        }

        public IActionResult Login()
        {
            return Ok(new { Login = "Not Logged In" });
        }
        
        [HttpPost]
        public async Task<ActionResult<LoginRequest>> Login([FromBody] LoginRequest loginrequest)
        {
            var user = await _userManager.FindByNameAsync(loginrequest.UserName);

            if (user != null)
            {
                var signInResult = await _signInManager.PasswordSignInAsync(user, loginrequest.Password, false, false);

                if (signInResult.Succeeded)
                {
                    return new JsonResult(new { RedirectUrl = loginrequest.ReturnUrl, IsOk = true });
                }
            }
            return Unauthorized();
        }

        public IActionResult Register()
        {
            return Ok(new { Register = "empty" });
        }

        [HttpPost]
        public async Task<IActionResult> Register(string username, string password)
        {

            var user = new IdentityUser
            {
                UserName = username,
                Email = "",
            };

            var result = await _userManager.CreateAsync(user, password);

            if (result.Succeeded)
            {
                var signInResult = await _signInManager.PasswordSignInAsync(user, password, false, false);

                if (signInResult.Succeeded)
                {
                    return RedirectToAction("Home/Authenticate");
                }
            }
            return Ok(new { Login = "empty" });
        }

        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { Login = "empty" });
        }

        [Authorize]
        public IActionResult Authenticate()
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, "some_id"),
                new Claim("wk", "cookie")
            };

            var secretBytes = Encoding.UTF8.GetBytes(Constants.Secret);
            var key = new SymmetricSecurityKey(secretBytes);
            var algorithm = SecurityAlgorithms.HmacSha256;

            var signingCredientials = new SigningCredentials(key, algorithm);

            var token = new JwtSecurityToken(
                Constants.Issuer,
                Constants.Audiance,
                claims,
                notBefore: DateTime.Now,
                expires: DateTime.Now.AddHours(1),
                signingCredientials
                );

            var tokenJson = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { access_token = tokenJson });
        }
        */
        public IActionResult Configure()
        {
            return Ok(new
            {
                authority = "https://localhost:5001",
                client_id = "client_id_js",
                redirect_uri = "https://localhost:2001/authentication/login-callback",
                response_type = "id_token token",
                scope = "openid ApiOne",
                post_logout_redirect_uri = "https://localhost:2001/authentication/login-callback"
            });
        }
    }
}
