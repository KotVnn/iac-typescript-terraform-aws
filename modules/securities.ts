import { Construct } from 'constructs';
import {SecurityGroup} from '@cdktf/provider-aws/lib/security-group';

export class SecurityModule extends Construct {
	public readonly publicSecurityGroupId: string;
	public readonly privateSecurityGroupId: string;
	
	constructor(scope: Construct, id: string) {
		super(scope, id);
		
		// Public Security Group
		const publicSecurityGroup = new SecurityGroup(this, 'publicSecurityGroup', {
			name: 'public_security_group',
			description: 'public_security_group',
			ingress: [
				{
					fromPort: 443,
					toPort: 443,
					protocol: 'tcp',
					cidrBlocks: ['0.0.0.0/0']
				},
				{
					fromPort: 80,
					toPort: 80,
					protocol: 'tcp',
					cidrBlocks: ['0.0.0.0/0']
				},
				{
					fromPort: 22,
					toPort: 22,
					protocol: 'tcp',
					cidrBlocks: ['0.0.0.0/0']
				}
			],
			egress: [
				{
					fromPort: 0,
					toPort: 0,
					protocol: '-1',
					cidrBlocks: ['0.0.0.0/0']
				}
			]
		});
		
		this.publicSecurityGroupId = publicSecurityGroup.id;
		
		// Private Security Group
		const privateSecurityGroup = new SecurityGroup(this, 'privateSecurityGroup', {
			name: 'private_security_group',
			description: 'private_security_group',
			ingress: [
				{
					fromPort: 80,
					toPort: 80,
					protocol: 'tcp',
					securityGroups: [publicSecurityGroup.id]
				},
				{
					fromPort: 3306,
					toPort: 3306,
					protocol: 'tcp',
					securityGroups: [publicSecurityGroup.id]
				}
			],
			egress: [
				{
					fromPort: 0,
					toPort: 0,
					protocol: '-1',
					cidrBlocks: ['0.0.0.0/0']
				}
			]
		});
		
		this.privateSecurityGroupId = privateSecurityGroup.id;
	}
}
