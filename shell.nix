{ sources ? import ./nix/sources.nix }:
let pkgs = import sources.nixpkgs { };
in pkgs.mkShell { buildInputs = [ pkgs.nodejs pkgs.nixfmt ]; }
