using IdentityModel;
using IdentityServer4;
using IdentityServer4.Models;
using System.Collections.Generic;

namespace ASPReact_Auth
{
    public static class Config
    {
        public static IEnumerable<IdentityResource> GetIds()
        { 
            return new List<IdentityResource>
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
                //new IdentityResources.Email(),
            };
        }

        public static IEnumerable<ApiResource> GetApis()
        { 
            return new List<ApiResource>
            {
                new ApiResource(IdentityServerConstants.LocalApi.ScopeName),
            };
        }

        public static IEnumerable<Client> GetClients()
        {
            return new List<Client>
            {
                // JavaScript Client
                new Client
                {
                    ClientId = "client_id_js",
                    ClientName = "JavaScript Client",

                    AllowedGrantTypes = GrantTypes.Code,
                    AllowAccessTokensViaBrowser = true,
                    RequirePkce = true,
                    RequireClientSecret = false,
                    RequireConsent = false,

                    // root/callback
                    RedirectUris =           { "https://localhost:5001/authentication/login-callback" },
                    PostLogoutRedirectUris = { "https://localhost:5001/" },

                    AllowedScopes =
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Profile,
                        IdentityServerConstants.LocalApi.ScopeName,
                    },
                    
                    // uncomment to allow claims in the id_token
                    AlwaysIncludeUserClaimsInIdToken = true
                }
            };
        }
    }
}