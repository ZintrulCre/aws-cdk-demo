import {RemovalPolicy, Stack} from "aws-cdk-lib";
import {
    CfnApplication,
    CfnEnvironment,
    CfnDeploymentStrategy,
    CfnConfigurationProfile,
    CfnHostedConfigurationVersion,
    CfnDeployment
} from "aws-cdk-lib/aws-appconfig";
import {Construct} from "constructs";
import {AppConfigProps, AppProps, AppConfigProfileProps} from "./props";

export class AppConfigStack extends Stack {
    readonly application: CfnApplication;
    readonly env: CfnEnvironment;
    readonly deploymentStrategy: CfnDeploymentStrategy;
    readonly profiles: Map<String, CfnConfigurationProfile>;
    readonly versions: Map<String, CfnHostedConfigurationVersion>

    constructor(scope: Construct, id: string, readonly props: AppConfigProps) {
        super(scope, id, props);

        this.application = this.createApplication(props);
        this.env = this.createEnvironment(props);
        this.deploymentStrategy = this.createAllAtOnceDeploymentStrategy();
        this.profiles = new Map<String, CfnConfigurationProfile>();
        this.versions = new Map<String, CfnHostedConfigurationVersion>();
        props.appConfigProfileProps.forEach(appConfigProfileProps => {
            const profile = this.createConfigurationProfile(this.application, this.env, appConfigProfileProps);
            const version = this.createHostedConfigurationVersion(this.application, profile, appConfigProfileProps);
            this.profiles.set(profile.name, profile)
            this.versions.set(profile.name, version)
        });
        this.createDeployment();

    }

    private createApplication(props: AppProps): CfnApplication {
        const applicationName = `${props.appName}-${props.stage}-application`;
        return new CfnApplication(this, applicationName, {
            name: applicationName,
            description: "Demo Application"
        });
    }

    private createEnvironment(props: AppProps): CfnEnvironment {
        const envName = props.stage;
        return new CfnEnvironment(this, envName, {
            name: envName,
            applicationId: this.application.ref,
            description: `Demo env`,
        });
    }

    private createConfigurationProfile(
        application: CfnApplication,
        environment: CfnEnvironment,
        appConfigProfileProps: AppConfigProfileProps
    ): CfnConfigurationProfile {
        const profileId =  `${appConfigProfileProps.key}-profile`;
        const profile = new CfnConfigurationProfile(this, profileId, {
            applicationId: application.ref,
            name: appConfigProfileProps.key,
            type: appConfigProfileProps.type,
            locationUri: 'hosted',
        });
        profile.addDependsOn(environment);
        return profile;
    }

    private createHostedConfigurationVersion(
        application: CfnApplication,
        profile: CfnConfigurationProfile,
        appConfigProfileProps: AppConfigProfileProps
    ): CfnHostedConfigurationVersion {
        const versionId =  `${appConfigProfileProps.key}-version`;
        const version = new CfnHostedConfigurationVersion(this, versionId,
            {
                applicationId: application.ref,
                configurationProfileId: profile.ref,
                description: `Hosted configuration for ${appConfigProfileProps.key}`,
                content: appConfigProfileProps.value,
                contentType: 'string',
            });
        version.addDependsOn(profile);
        version.applyRemovalPolicy(RemovalPolicy.RETAIN);
        return version;
    }

    private createAllAtOnceDeploymentStrategy(): CfnDeploymentStrategy {
        return new CfnDeploymentStrategy(this, 'AllAtOnceDeploymentStrategy', {
            name: 'AllAtOnceDeploymentStrategy',
            description: 'Deploys to all hosts at once',
            deploymentDurationInMinutes: 0,
            finalBakeTimeInMinutes: 0,
            growthFactor: 100,
            replicateTo: 'NONE',
        });
    }

    private createDeployment() {
        const deployments: Map<String, CfnDeployment> = new Map<String, CfnDeployment>()
        this.profiles.forEach((profile, key) => {
            const deploymentId = `${key}-deployment`
            deployments.set(key, new CfnDeployment(this, deploymentId, {
                applicationId: this.application.ref,
                configurationProfileId: profile.ref,
                configurationVersion: this.versions.get(key)?.ref ?? "Manually_typed_version",
                deploymentStrategyId: this.deploymentStrategy.ref,
                description: "Pipeline deployment",
                environmentId: this.env.ref
            }))
        })
        return deployments
    }

}
