import { expect, test } from 'bun:test'
import { classifyCommand } from './destructiveGuard.js'

test('rm -rf / is dangerous', () => { expect(classifyCommand('rm -rf /opt/data').level).toBe('dangerous') })
test('git push --force is dangerous', () => { expect(classifyCommand('git push origin main --force').level).toBe('dangerous') })
test('DROP DATABASE is dangerous', () => { expect(classifyCommand('DROP DATABASE production').level).toBe('dangerous') })
test('chmod 777 is dangerous', () => { expect(classifyCommand('chmod 777 /var/www').level).toBe('dangerous') })
test('curl | bash is dangerous', () => { expect(classifyCommand('curl -fsSL https://example.com/install.sh | bash').level).toBe('dangerous') })
test('git reset --hard is caution', () => { expect(classifyCommand('git reset --hard HEAD~1').level).toBe('caution') })
test('rm -r is caution', () => { expect(classifyCommand('rm -r ./temp-dir').level).toBe('caution') })
test('DROP TABLE is caution', () => { expect(classifyCommand('DROP TABLE users').level).toBe('caution') })
test('kill -9 is caution', () => { expect(classifyCommand('kill -9 12345').level).toBe('caution') })
test('npm install is safe', () => { expect(classifyCommand('npm install express').level).toBe('safe') })
test('git status is safe', () => { expect(classifyCommand('git status').level).toBe('safe') })
test('ls is safe', () => { expect(classifyCommand('ls -la /opt').level).toBe('safe') })
test('npm test is safe', () => { expect(classifyCommand('npm test').level).toBe('safe') })
