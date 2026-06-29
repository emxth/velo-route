"""
VeloRoute CI runner.

Orchestrates install, test, and build steps for the MERN stack from a single
Python entry point. Suitable for local runs and GitHub Actions / other CI hosts.

Usage:
  python ci/run.py              # full pipeline
  python ci/run.py --stage test # server + client tests only
  python ci/run.py --stage server-test
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SERVER = ROOT / "server"
CLIENT = ROOT / "client"

# .env is gitignored, so CI must inject the same values tests expect locally.
SERVER_TEST_ENV: dict[str, str] = {
    "NODE_ENV": "test",
    "JWT_SECRET": "testsecret",
    "JWT_EXPIRES_IN": "1d",
    "CORS_ORIGIN": "http://localhost:3000",
    "MAIL_HOST": "smtp.example.com",
    "MAIL_PORT": "587",
    "MAIL_USER": "ci@test.com",
    "MAIL_PASS": "ci-mail-pass",
    "MAIL_FROM": "VeloRoute CI <ci@test.com>",
}


@dataclass
class StepResult:
    name: str
    ok: bool
    seconds: float
    message: str = ""


@dataclass
class CiRunner:
    root: Path = ROOT
    install: bool = True
    verbose: bool = False
    results: list[StepResult] = field(default_factory=list)

    def _npm(self) -> str:
        npm = shutil.which("npm")
        if not npm:
            raise RuntimeError("npm is not on PATH. Install Node.js 18+ first.")
        return npm

    def _run(
        self,
        name: str,
        args: list[str],
        *,
        cwd: Path,
        env: dict[str, str] | None = None,
    ) -> StepResult:
        npm = self._npm()
        command = [npm] + args
        merged_env = os.environ.copy()
        if env:
            merged_env.update(env)

        print(f"\n{'=' * 60}")
        print(f"STEP: {name}")
        print(f"CWD:  {cwd}")
        print(f"CMD:  {' '.join(command)}")
        print("=" * 60)

        start = time.perf_counter()
        completed = subprocess.run(
            command,
            cwd=cwd,
            env=merged_env,
            check=False,
        )
        elapsed = time.perf_counter() - start
        ok = completed.returncode == 0
        message = "passed" if ok else f"failed (exit code {completed.returncode})"

        result = StepResult(name=name, ok=ok, seconds=elapsed, message=message)
        self.results.append(result)

        status = "PASS" if ok else "FAIL"
        print(f"\n[{status}] {name} — {message} ({elapsed:.1f}s)")
        return result

    def install_dependencies(self) -> StepResult:
        return self._run("install-server", ["ci"], cwd=SERVER)

    def install_client_dependencies(self) -> StepResult:
        return self._run("install-client", ["ci"], cwd=CLIENT)

    def server_test(self) -> StepResult:
        return self._run("server-test", ["test"], cwd=SERVER, env=SERVER_TEST_ENV)

    def client_test(self) -> StepResult:
        return self._run(
            "client-test",
            ["test", "--", "--watchAll=false", "--passWithNoTests"],
            cwd=CLIENT,
            env={"CI": "true"},
        )

    def client_build(self) -> StepResult:
        return self._run(
            "client-build",
            ["run", "build"],
            cwd=CLIENT,
            env={"DISABLE_ESLINT_PLUGIN": "true"},
        )

    def run_stage(self, stage: str) -> int:
        steps: dict[str, list] = {
            "install": [self.install_dependencies, self.install_client_dependencies],
            "server-test": [self.server_test],
            "client-test": [self.client_test],
            "client-build": [self.client_build],
            "test": [self.server_test, self.client_test],
            "build": [self.client_build],
            "all": [],
        }

        if stage == "all":
            pipeline: list = []
            if self.install:
                pipeline.extend(steps["install"])
            pipeline.extend(steps["test"])
            pipeline.extend(steps["build"])
        elif stage in steps:
            pipeline = steps[stage]
        else:
            print(f"Unknown stage: {stage}", file=sys.stderr)
            return 2

        for step in pipeline:
            result = step()
            if not result.ok:
                self.print_summary()
                return 1

        self.print_summary()
        return 0

    def print_summary(self) -> None:
        print(f"\n{'=' * 60}")
        print("CI SUMMARY")
        print("=" * 60)
        for result in self.results:
            status = "PASS" if result.ok else "FAIL"
            print(f"  [{status}] {result.name:<20} {result.seconds:6.1f}s  {result.message}")
        passed = sum(1 for r in self.results if r.ok)
        total = len(self.results)
        print(f"\n{passed}/{total} steps passed")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run VeloRoute CI pipeline")
    parser.add_argument(
        "--stage",
        choices=["all", "install", "test", "build", "server-test", "client-test", "client-build"],
        default="all",
        help="Pipeline stage to run (default: all)",
    )
    parser.add_argument(
        "--skip-install",
        action="store_true",
        help="Skip npm ci for server and client",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Reserved for future use; npm output is always streamed",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    runner = CiRunner(install=not args.skip_install, verbose=args.verbose)
    return runner.run_stage(args.stage)


if __name__ == "__main__":
    raise SystemExit(main())
