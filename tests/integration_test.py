"""
Integration test for the production server.

Starts `serve_production.py` in a subprocess, polls /health until ready,
sends a predict request, and then terminates the server.

Run from the project root with your venv active:
  python -m tests.integration_test
"""
import subprocess
import sys
import time
import requests
import os


def start_server(port=5050):
    cmd = [sys.executable, os.path.join(os.path.dirname(os.getcwd()), 'serve_model.py')]
    env = os.environ.copy()
    env['PORT'] = str(port)
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, cwd=os.path.dirname(os.getcwd()))
    return proc


def wait_for_health(port=5050, timeout=30.0):
    url = f'http://127.0.0.1:{port}/health'
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = requests.get(url, timeout=2)
            if r.status_code == 200:
                return r.json()
        except Exception:
            pass
        time.sleep(0.5)
    raise RuntimeError('Server did not become healthy within timeout')


def test_predict(port=5050):
    url = f'http://127.0.0.1:{port}/predict'
    payload = {"sensor_1": 0.0, "sensor_2": 0.0}
    r = requests.post(url, json=payload, timeout=5)
    r.raise_for_status()
    data = r.json()
    assert 'probability' in data and 'prediction' in data
    print('Predict response:', data)


def main():
    port = 5050
    proc = start_server(port=port)
    try:
        print('Waiting for server health...')
        health = wait_for_health(port=port, timeout=30)
        print('Health ok:', health)
        test_predict(port=port)
        print('Integration test passed')
    except Exception as e:
        print('Integration test failed:', e)
        # print subprocess stderr for diagnosis
        try:
            out, err = proc.communicate(timeout=1)
            print('Server stdout:', out.decode(errors='ignore'))
            print('Server stderr:', err.decode(errors='ignore'))
        except Exception:
            pass
        raise
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()


if __name__ == '__main__':
    main()
